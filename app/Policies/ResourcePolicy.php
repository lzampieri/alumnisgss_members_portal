<?php

namespace App\Policies;

use App\Models\Resource;
use App\Models\DynamicPermission;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;
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
    public function view(?User $user, Resource $resource)
    {
        return DynamicPermission::UserCanViewPermissable($resource, $user ? $user->identity : NULL) || DynamicPermission::UserCanEditPermissable($resource, $user ? $user->identity : NULL);
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
