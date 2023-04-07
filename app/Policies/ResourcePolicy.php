<?php

namespace App\Policies;

use App\Http\Controllers\Log;
use App\Models\Resource;
use App\Models\DynamicPermission;
use App\Models\LoginMethod;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Auth;

class ResourcePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Resource  $resource
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?User $user, Resource $resource)
    {
        return DynamicPermission::UserCanViewPermissable( $resource, $user->identity ) || DynamicPermission::UserCanEditPermissable( $resource, $user->identity );
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo( 'documents-upload' );
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Resource  $resource
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, Resource $resource)
    {
        return DynamicPermission::UserCanEditPermissable( $resource, $user->identity );
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Resource  $resource
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Resource $resource)
    {
        return DynamicPermission::UserCanEditPermissable( $resource, $user->identity );
    }
}
