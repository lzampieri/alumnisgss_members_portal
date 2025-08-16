<?php

namespace App\Http\Controllers;

use App\Models\DynamicPermission;
use App\Models\File;
use App\Models\Permalink;
use App\Models\Resource;
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

        // The shown resources are the ones at the same level
        if ( is_null($resource) || $resource->isRoot ) {
            $prequery = Resource::isRoot();
        } else {
            $prequery = $resource->siblingsAndSelf();
        }

        $params['resources'] = $prequery->with(['permalinks'])->withCount(['children'])->get()->filter->canView;

        if ($resource) {
            $this->authorize('view', $resource);

            $params['resource'] = $resource->load(['ancestors','parent'])->append(['canView', 'canEdit', 'visibleChildren'])
                ->load(['dynamicPermissions', 'dynamicPermissions.role', 'files', 'permalinks']);

            $params['resource']->makeHidden('children');

            if( $params['resource']->parent ) {
                if( !$params['resource']->parent->canView ) $params['resource']->makeHidden('parent');
                else $params['resource']->parent->load('permalinks');
            }
        }

        $params['roles'] = Role::where('name', '!=', 'webmaster')->orderBy('id')->get();
        $params['canCreate'] = Auth::check() && Auth::user()->can('create', Resource::class);

        $params['allowedFormats'] = File::ALLOWED_FORMATS;

        $params['possibleParents'] = $this->getPossibleParentsList($resource);
        $params['possibleParentsForNew'] = $this->getPossibleParentsList();

        return Inertia::render('Resources/Main', $params);
    }

    public function getPossibleParentsList(Resource $resource = null) {
        $resources = Resource::tree()->depthFirst()->get(['id','title','depth','path']);
        $resources = $resources->filter(function ($res) use ($resource) {
            return is_null($resource) || !in_array( $resource->id, explode('.', $res->path) );
        })->filter->canView;

        return array_values($resources->toArray());
    }


    public function create(Request $request)
    {
        $this->authorize('create', Resource::class);
        $possibleParents = implode(',', array_map(function ($res) { return $res['id']; }, $this->getPossibleParentsList() ) );

        $validated = $request->validate([
            'title' => 'required|min:3',
            'parent' => 'in:' . $possibleParents,
            'canView' => 'array|min:1',
            'canView.*' => 'integer|exists:roles,id',
            'canEdit' => 'array|min:1',
            'canEdit.*' => 'integer|exists:roles,id',
        ]);

        // Check the current user have the permissions to edit the resource
        $current_user = Auth::user()->identity;
        if (!$current_user->hasRole(Role::findByName('webmaster'))) {
            $current_roles = $current_user->getAllRoles()->pluck('id')->toArray();
            if (count(array_intersect($current_roles, $validated['canEdit'])) == 0) {
                return back()->withErrors(['canEdit' => 'Stai creando una risorsa che non avresti i permessi di modificare. Aggiungi un tuo ruolo.'])->withInput();
            }
        }

        // Create the resource
        $res = Resource::create(['title' => $validated['title']]);

        if(isset($validated['parent'])) {
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

    public function update_title(Resource $resource, Request $request)
    {
        $this->authorize('edit', $resource);

        $possibleParents = implode(',', array_map(function ($res) { return $res['id']; }, $this->getPossibleParentsList($resource) ) );
        Log::debug($possibleParents);

        $validated = $request->validate([
            'title' => 'required|min:3',
            'parent' => 'in:' . $possibleParents
        ]);

        $resource->title = $validated['title'];
        $resource->parent_id = $validated['parent'];
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

        if( $enabled ) {
            if( $resource->access_token == null )
                $resource->access_token = Str::random(16);
        }
        else {
            $resource->access_token = null;
        }

        $resource->save();

        return redirect()->back()->with(['notistack' => ['success', 'Salvato']]);
    }
}
