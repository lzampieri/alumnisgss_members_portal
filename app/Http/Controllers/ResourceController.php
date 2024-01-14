<?php

namespace App\Http\Controllers;

use App\Models\DynamicPermission;
use App\Models\File;
use App\Models\Permalink;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class ResourceController extends Controller
{
    public function list( Resource $resource = null )
    {
        $params = [];

        $params['resources'] = Resource::with('permalinks')->get()->filter->canView;
        $params['hidden'] = Resource::count() - $params['resources']->count();

        if( $resource ) {
            $this->authorize('view', $resource);

            $params['resource'] = $resource->append(['canView','canEdit'])
                ->load(['dynamicPermissions','dynamicPermissions.role','files','permalinks']);
        }

        $params['roles'] = Role::where('name','!=','webmaster')->orderBy('id')->get();
        $params['canCreate'] = Auth::check() && Auth::user()->can('create', Resource::class);

        $params['allowedFormats'] = File::ALLOWED_FORMATS;

        return Inertia::render( 'Resources/Main', $params );
    }
   

    public function create(Request $request)
    {
        $this->authorize('create', Resource::class);

        $validated = $request->validate([
            'title' => 'required|min:3',
            'canView' => 'array|min:1',
            'canView.*' => 'integer|exists:roles,id',
            'canEdit' => 'array|min:1',
            'canEdit.*' => 'integer|exists:roles,id',
        ]);

        // Check the current user have the permissions to edit the resource
        $current_user = Auth::user()->identity;
        if( !$current_user->hasRole( Role::findByName('webmaster') )  ) {
            $current_roles = $current_user->getAllRoles()->pluck('id')->toArray();
            if( count( array_intersect( $current_roles, $validated['canEdit'] ) ) == 0 ) {
                return back()->withErrors(['canEdit'=>'Stai creando una risorsa che non avresti i permessi di modificare. Aggiungi un tuo ruolo.'])->withInput();
            }
        }

        // Create the resource
        $res = Resource::create(['title' => $validated['title']]);
        Log::debug('Resource created', $res);

        // Save the canView
        foreach( $validated['canView'] as $role ) {
            $dynamicPermission = DynamicPermission::createFromRelations( 'view', $res, Role::findById( $role ) );
            Log::debug('Dynamic permission set', $dynamicPermission );
        }

        // Save the canEdit
        foreach( $validated['canEdit'] as $role ) {
            $dynamicPermission = DynamicPermission::createFromRelations( 'edit', $res, Role::findById( $role ) );
            Log::debug('Dynamic permission set', $dynamicPermission );
        }

        return redirect()->route('resources', [ 'resource' => $res ] );
    }

    public function update_permissions(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'newList' => 'array',
            'newList.*' => 'integer|exists:roles,id',
            'type' => 'required|in:view,edit'
        ]);

        $res = Resource::find( $validated['resourceId'] );
        
        $this->authorize('edit', $res);


        $new_roles = $validated['newList'];
        $type = $validated['type'];

        $current_roles = $res->dynamicPermissions()->where('type',$type)->get()->pluck('role_id')->toArray();

        foreach( array_diff( $current_roles, $new_roles ) as $role ) {
            // Roles to remove
            $dynamicPermission = $res->dynamicPermissions()->where( 'role_id', $role )->where( 'type', $type )->get();
            foreach( $dynamicPermission as $dp ) {
                Log::debug('Dynamic permission removed', $dp );
                $dp->delete();
            }
        }
        foreach( array_diff( $new_roles, $current_roles ) as $role ) {
            // Roles to add
            $dynamicPermission = DynamicPermission::createFromRelations( $type, $res, Role::findById( $role ) );
            Log::debug('Dynamic permission set', $dynamicPermission );
        }

        return redirect()->back()->with(['notistack' => ['success', 'Permessi aggiornati']]);
    }

    public function update_content(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'content' => ''
        ]);

        $res = Resource::find( $validated['resourceId'] );
        
        $this->authorize('edit', $res);

        $res->content = $validated['content'];
        $res->save();
        Log::debug('Resource content updated', $res );

        return redirect()->back()->with(['notistack' => ['success', 'Salvato']]);
    }

    public function upload_file(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'file' => 'required|mimes:' . implode(",",File::ALLOWED_FORMATS),
        ]);
        $res = Resource::find( $validated['resourceId'] );

        // Validate file extension
        $filename = $validated['file']->getClientOriginalName();
        $extension = pathinfo($filename)['extension'];
        if( !in_array( $extension, File::ALLOWED_FORMATS ) )
            return back()->withErrors(['file'=>'Estensione non riconosciuta'])->withInput();

        // Compute cleaned file name
        $cleaned_name = preg_replace( "([^\w\s\d\_])", "", str_replace( " ", "_", pathinfo($filename)['filename'] ) );

        // Upload file
        $file = File::create();
        $file->handle =  'f' . $file->id . '_' . $cleaned_name . '.' . $extension;
        $file->parent()->associate( $res )->save();
        $file->save();
        $validated['file']->storeAs('files', $file->handle );
        Log::debug('File uploaded', $file );

        return redirect()->back()->with(['notistack' => ['success', 'File caricato'], 'inertiaFlash' => ['selectedFileHandle' => $file->handle, 'selectedFileExt' => $extension ]]);
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
        ]);

        $res = Resource::find( $validated['resourceId'] );
        
        $this->authorize('delete', $res);

        Log::debug('Resource deleted', $res );
        $res->delete();

        return redirect()->route('resources')->with(['notistack' => ['success', 'Eliminata']]);
    }

    public function add_permalink(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
            'link' => 'required|string|max:125|alpha_dash|unique:permalinks,id'
        ]);

        $res = Resource::find( $validated['resourceId'] );
        
        $permalink = new Permalink([ 'id' => $validated['link'] ]);
        $permalink->linkable()->associate( $res );
        $permalink->save();

        Log::debug('New permalink created', $permalink );

        return redirect()->route('permalink',['permalink'=>$permalink])->with(['notistack' => ['success', 'Salvato']]);
    }
}
