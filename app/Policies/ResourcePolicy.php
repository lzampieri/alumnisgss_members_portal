<?php

namespace App\Policies;

use App\Http\Controllers\Log;
use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use App\Models\Resource;
use App\Models\DynamicPermission;
use App\Models\File;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Auth;

class ResourcePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Resource  $resource
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?User $user, Resource $resource, ?File $file = null)
    {
        if( DynamicPermission::UserCanViewPermissable($resource, $user ? $user->identity : NULL) || DynamicPermission::UserCanEditPermissable($resource, $user ? $user->identity : NULL) )
            return true;

        // Check for Magic Link
        $token = request()->get('tk');
        if( $token ) {
            $res = $resource;
            while( $res ) {
                if( $res->access_token == $token ) {
                    if( $file )
                        LogController::log( LogEvents::FILE_VIA_MAGICLINK, $file, 'via token of resource:', $res->id );
                    else
                        LogController::log( LogEvents::RESOURCE_VIA_MAGICLINK, $resource, 'via token of resource:', $res->id );
                    return true;
                }
                $res = $res->parent;
            }
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('resources-create');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Resource  $resource
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, Resource $resource)
    {
        return DynamicPermission::UserCanEditPermissable($resource, $user ? $user->identity : NULL);
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Resource  $resource
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Resource $resource)
    {
        return DynamicPermission::UserCanEditPermissable($resource, $user ? $user->identity : NULL);
    }
}
