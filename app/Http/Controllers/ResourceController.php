<?php

namespace App\Http\Controllers;

use App\Models\DynamicPermission;
use App\Models\Resource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class ResourceController extends Controller
{
    public function list( Resource $resource = null )
    {
        $params = [];

        $params['resources'] = Resource::all()->filter->canView;
        $params['hidden'] = Resource::count() - $params['resources']->count();

        if( $resource ) {
            $this->authorize('view', $resource);

            $params['resource'] = $resource->append(['canView','canEdit'])
                ->load(['dynamicPermissions','dynamicPermissions.role']);
        }

        $params['roles'] = Role::where('name','!=','webmaster')->orderBy('id')->get();

        return Inertia::render( 'Resources/Main', $params );
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

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'resourceId' => 'required|integer|exists:resources,id',
        ]);

        $res = Resource::find( $validated['resourceId'] );
        
        $this->authorize('edit', $res);

        Log::debug('Resource deleted', $res );
        $res->delete();

        return redirect()->route('resources')->with(['notistack' => ['success', 'Eliminata']]);
    }

}
