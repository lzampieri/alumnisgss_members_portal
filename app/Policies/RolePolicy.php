<?php

namespace App\Policies;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use App\Models\Role;
use App\Models\DynamicPermission;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class RolePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?User $user, Role $role)
    {
        if( $role->isAutomatic ) return false;

        if( DynamicPermission::UserCanViewPermissable($role, $user ? $user->identity : NULL)
            || DynamicPermission::UserCanEditPermissable($role, $user ? $user->identity : NULL) )
            return true;

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
        return $user->hasPermissionTo('roles-create');
    }


    /**
     * Determine whether the user can update the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, Role $role)
    {
        if( $role->isAutomatic ) return false;

        return DynamicPermission::UserCanEditPermissable($role, $user ? $user->identity : NULL);
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Role $role)
    {
        return DynamicPermission::UserCanEditPermissable($role, $user ? $user->identity : NULL);
    }
}
