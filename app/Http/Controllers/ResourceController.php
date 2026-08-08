<?php

namespace App\Http\Controllers;

use App\Models\DynamicPermission;
use App\Models\File;
use App\Models\Permalink;
use App\Models\Resource;
use App\Policies\FilePolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx\Rels;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class ResourceController extends Controller
{
    public function list(Resource $resource = null)
    {
        // No authorization: visible by anyone

        $params = [];

        if ($resource) {
            $this->authorize('view', $resource);

            $params['resource'] = $resource->append(['canView', 'canEdit', 'visibleChildren', 'visibleAncestors', 'pluckedParent'])
                ->load(['dynamicPermissions', 'dynamicPermissions.role', 'files', 'permalinks']);

            $params['resource']->makeHidden('children');

            if ($params['resource']->canView) {
                $params['resource']->makeVisible('access_token');
            }
        }

        $params['possibleParents'] = $this->getPossibleParentsList($resource);

        return Inertia::render('Resources/Main', $params + $this->getParamsForMenu($resource));
    }

    public function archive_list()
    {
        $this->authorize('see_archive', Resource::class);

        $params = [];

        $resources = Resource::tree()->depthFirst()->with(['permalinks'])->withCount(['children'])->get();
        $params['list'] = array_values($resources->filter->canView->map->only(['id', 'title', 'path', 'depth', 'archived', 'permalinks', 'children_count'])->toArray());

        return Inertia::render('Resources/Archive', $params + $this->getParamsForMenu());
    }

    protected function getParamsForMenu(Resource $resource = null)
    {
        $params = [];

        // The shown resources are the ones at the same level
        $token = request()->get('tk');
        if ($token && $resource && $resource->access_token == $token) {
            // I am accessing with a magic link relative to this specific resource (and its sons):
            // Only show resources at the same level
            $prequery = Resource::where('id', $resource->id);
        } else if (is_null($resource) || $resource->isRoot) {
            // I am accessing the root: show all roots
            $prequery = Resource::isRoot();
        } else {
            // I am accessing a leaf or a branch: show all resources at the same level
            $prequery = $resource->siblingsAndSelf();
        }

        // If not already in the archive, not show archive.
        if (is_null($resource) || (!$resource->archived && !$resource->isChildOfArchived())) $prequery = $prequery->where('archived', false);

        $params['resources'] = array_values($prequery->with(['permalinks'])->withCount(['children'])->get()->filter->canView->toArray());


        $params['roles'] = Role::where('name', '!=', 'webmaster')->orderBy('id')->get();
        $params['canCreate'] = Auth::check() && Auth::user()->can('create', Resource::class);
        $params['canSeeArchive'] = Auth::check() && Auth::user()->can('see_archive', Resource::class);

        $params['allowedFormats'] = File::ALLOWED_FORMATS;
        $params['allowedImagesFormats'] = File::ALLOWED_IMAGES_FORMATS;

        $params['possibleParentsForNew'] = $this->getPossibleParentsList();

        return $params;
    }

    public function getPossibleParentsList(Resource $resource = null)
    {
        $resources = Resource::tree()->depthFirst()->get();
        $resources = $resources->filter(function ($res) use ($resource) {
            return is_null($resource) || !in_array($resource->id, explode('.', $res->path));
        })->filter(function ($res) {
            return !$res->archived && !$res->isChildOfArchived();
        })->filter->canView->map->only(['id', 'title', 'path', 'depth']);

        return array_values($resources->toArray());
    }


    public function create(Request $request)
    {
        $this->authorize('create', Resource::class);
        $possibleParents = implode(',', array_map(function ($res) {
            return $res['id'];
        }, $this->getPossibleParentsList()));

        $validated = $request->validate([
            'title' => 'required|min:3',
            'parent' => 'in:' . $possibleParents,
            'canView' => 'array|min:1',
            'canView.*' => 'integer|exists:roles,id',
            'canEdit' => 'array|min:1',
            'canEdit.*' => 'integer|exists:roles,id',
        ]);

        // Check the current user have the permissions to edit the resource
        $current_user = Auth::user();
        if (!$current_user->hasRole(Role::findByName('webmaster'))) {
            $current_roles = $current_user->getAllRoles()->pluck('id')->toArray();
            if (count(array_intersect($current_roles, $validated['canEdit'])) == 0) {
                return back()->withErrors(['canEdit' => 'Stai creando una risorsa che non avresti i permessi di modificare. Aggiungi un tuo ruolo.'])->withInput();
            }
        }

        // Create the resource
        $res = Resource::create(['title' => $validated['title']]);

        if (isset($validated['parent'])) {
            $res->parent_id = $validated['parent'];
            $res->save();
        }

        // Save the canView
        foreach ($validated['canView'] as $role) {
            $dynamicPermission = DynamicPermission::createFromRelations('view', $res, Role::findById($role));
        }

        // Save the canEdit
        foreach ($validated['canEdit'] as $role) {
            $dynamicPermission = DynamicPermission::createFromRelations('edit', $res, Role::findById($role));
        }

        return redirect()->route('resources', ['resource' => $res]);
    }

    public function update_permissions(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'newList' => 'array',
            'newList.*' => 'integer|exists:roles,id',
            'type' => 'required|in:view,edit'
        ]);

        $res = Resource::find($validated['resourceId']);

        $this->authorize('edit', $res);


        $new_roles = $validated['newList'];
        $type = $validated['type'];

        $current_roles = $res->dynamicPermissions()->where('type', $type)->get()->pluck('role_id')->toArray();

        foreach (array_diff($current_roles, $new_roles) as $role) {
            // Roles to remove
            $dynamicPermission = $res->dynamicPermissions()->where('role_id', $role)->where('type', $type)->get();
            foreach ($dynamicPermission as $dp) {
                $dp->delete();
            }
        }
        foreach (array_diff($new_roles, $current_roles) as $role) {
            // Roles to add
            $dynamicPermission = DynamicPermission::createFromRelations($type, $res, Role::findById($role));
        }

        return redirect()->back()->with(['notistack' => ['success', 'Permessi aggiornati']]);
    }

    private function update_permissions_all_recursive(Resource $res, $new_roles, $type)
    {
        $count = 0;

        if (Auth::check() && Auth::user()->can('edit', $res)) {
            $current_roles = $res->dynamicPermissions()->where('type', $type)->get()->pluck('role_id')->toArray();

            foreach (array_diff($current_roles, $new_roles) as $role) {
                // Roles to remove
                $dynamicPermission = $res->dynamicPermissions()->where('role_id', $role)->where('type', $type)->get();
                foreach ($dynamicPermission as $dp) {
                    $dp->delete();
                }
                $count++;
            }
            foreach (array_diff($new_roles, $current_roles) as $role) {
                // Roles to add
                $dynamicPermission = DynamicPermission::createFromRelations($type, $res, Role::findById($role));
                $count++;
            }
        }
        if ($count > 0) $count = 1;

        foreach ($res->children as $newres) {
            $count += $this->update_permissions_all_recursive($newres, $new_roles, $type);
        }

        return $count;
    }

    public function update_permissions_all(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'newList' => 'array',
            'newList.*' => 'integer|exists:roles,id',
            'type' => 'required|in:view,edit'
        ]);

        $res = Resource::find($validated['resourceId']);

        $count = $this->update_permissions_all_recursive($res, $validated['newList'], $validated['type']);

        return redirect()->back()->with(['notistack' => ['success', "Permessi aggiornati in {$count} risorse"]]);
    }

    public function update_title(Resource $resource, Request $request)
    {
        $this->authorize('edit', $resource);

        $possibleParents = implode(',', array_map(function ($res) {
            return $res['id'];
        }, $this->getPossibleParentsList($resource)));

        $validated = $request->validate([
            'title' => 'required|min:3',
            'parent' => 'nullable|in:' . $possibleParents
        ]);

        $resource->title = $validated['title'];
        if (array_key_exists('parent', $validated))
            $resource->parent_id = $validated['parent'];
        else
            $resource->parent_id = null;
        $resource->save();

        return redirect()->back()->with(['notistack' => ['success', 'Risorsa aggiornata']]);
    }

    public function update_content(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'content' => ''
        ]);

        $res = Resource::find($validated['resourceId']);

        $this->authorize('edit', $res);

        $res->content = $validated['content'];
        $res->save();

        return redirect()->back()->with(['notistack' => ['success', 'Salvato']]);
    }

    public function upload_file(Request $request)
    {
        // No authorization: visible by anyone

        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'file' => 'required|mimes:' . implode(",", File::ALLOWED_FORMATS),
        ]);
        $res = Resource::find($validated['resourceId']);

        // Validate file extension
        $filename = $validated['file']->getClientOriginalName();
        $extension = pathinfo($filename)['extension'];
        if (!in_array($extension, File::ALLOWED_FORMATS))
            return back()->withErrors(['file' => 'Estensione non riconosciuta'])->withInput();

        // Compute cleaned file name
        $cleaned_name = preg_replace("([^\w\s\d\_])", "", str_replace(" ", "_", pathinfo($filename)['filename']));

        // Upload file
        $file = File::create();
        $file->handle =  'f' . $file->id . '_' . $cleaned_name . '.' . $extension;
        $file->parent()->associate($res)->save();
        $file->save();
        $validated['file']->storeAs('files', $file->handle);

        return redirect()->back()->with(['notistack' => ['success', 'File caricato'], 'inertiaFlash' => ['selectedFileHandle' => $file->handle, 'selectedFileExt' => $extension]]);
    }

    public function retrive_image($handle = null)
    {
        $fallback = storage_path() . '/app/utils/no-image.jpg';
        $image = File::where('handle', $handle)->first();

        // Check that the image exists
        if (!$image)
            return response()->file($fallback);

        // Check that the image can be seen by the current user
        if (!(new FilePolicy)->view(Auth::user(), $image)) // Cannot use Auth::user->can since user can be null!
            return response()->file($fallback);

        return response()->file($image->path());
    }

    public function upload_image(Request $request)
    {
        // No authorization: visible by anyone

        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'file' => 'required|mimes:' . implode(",", File::ALLOWED_IMAGES_FORMATS),
        ]);
        $res = Resource::find($validated['resourceId']);

        // Validate file extension
        $filename = $validated['file']->getClientOriginalName();
        $extension = pathinfo($filename)['extension'];
        if (!in_array($extension, File::ALLOWED_IMAGES_FORMATS))
            return back()->withErrors(['file' => 'Estensione non riconosciuta'])->withInput();

        // Upload file
        $file = File::create();
        $file->handle =  'img' . $file->id . '.' . $extension;
        $file->parent()->associate($res)->save();
        $file->save();
        $validated['file']->storeAs('files', $file->handle);

        return redirect()->back()->with(['notistack' => ['success', 'File caricato'], 'inertiaFlash' => ['selectedImageHandle' => $file->handle]]);
    }

    public function archive(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'newState' => 'required|boolean'
        ]);

        $res = Resource::find($validated['resourceId']);

        $this->authorize('edit', $res);

        $res->archived = $validated['newState'];
        $res->save();

        return redirect()->route('resources')->with(['notistack' => ['success', $validated['newState'] ? 'Archiviata' : 'Ripristinata']]);
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
        ]);

        $res = Resource::find($validated['resourceId']);

        $this->authorize('delete', $res);

        $res->delete();

        return redirect()->route('resources')->with(['notistack' => ['success', 'Eliminata']]);
    }

    public function add_permalink(Request $request)
    {
        $this->authorize('create', Permalink::class);

        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'link' => 'required|string|max:125|alpha_dash|unique:permalinks,id'
        ]);

        $res = Resource::find($validated['resourceId']);

        $permalink = new Permalink(['id' => $validated['link']]);
        $permalink->linkable()->associate($res);
        $permalink->save();

        return redirect()->route('permalink', ['permalink' => $permalink])->with(['notistack' => ['success', 'Salvato']]);
    }

    public function magic_link(Resource $resource, Request $request)
    {
        $this->authorize('edit', $resource);

        $enabled = $request->input('enabled', false);

        if ($enabled) {
            if ($resource->access_token == null)
                $resource->access_token = Str::random(16);
        } else {
            $resource->access_token = null;
        }

        $resource->save();

        return redirect()->back()->with(['notistack' => ['success', 'Salvato']]);
    }


    public function upload_img_editor(Request $request, Resource $resource)
    {
        $this->authorize('edit', $resource);

        $validated = $request->validate([
            'image' => 'required|mimes:' . implode(",", File::ALLOWED_IMAGES_FORMATS)
        ]);

        $filename = $validated['image']->getClientOriginalName();
        $cleaned_name = preg_replace("([^\w\s\d\_])", "", str_replace(" ", "_", pathinfo($filename)['filename']));
        $extension = pathinfo($filename)['extension'];

        // Save file
        $file = File::create();
        $file->handle =  'f' . $file->id . '_' . $cleaned_name . '.' . $extension;
        $file->parent()->associate($resource)->save();
        $file->save();
        $validated['image']->storeAs('files', $file->handle);

        return response()->json(['handle' => $file->handle]);
    }

    public function retrive_img_editor(String $handle)
    {
        $fallback = storage_path() . '/app/utils/no-image.jpg';

        $file = File::where('handle', $handle)->first();
        // $file->load('parent');
        // return response()->json($file);
        if (!$file)
            return response()->file($fallback);

        // Check that the file can be seen by the current user
        if (!(new FilePolicy)->view(Auth::user(), $file)) // Cannot use Auth::user->can since user can be null!
            return response()->file($fallback);

        return response()->file($file->path());
    }
}
