<?php

namespace App\Policies;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use App\Models\Role;
use App\Models\DynamicPermission;
use App\Models\Person;
use Illuminate\Auth\Access\HandlesAuthorization;

class RolePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?Person $user, Role $role)
    {
        if ($role->isAutomatic) return false;

        if (
            DynamicPermission::PersonCanViewPermissable($role, $user)
            || DynamicPermission::PersonCanEditPermissable($role, $user)
        )
            return true;

        return false;
    }

    /**
     * Determine whether the person can create models.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(Person $user)
    {
        return $user->hasPermissionTo('roles-create');
    }


    /**
     * Determine whether the person can update the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(Person $user, Role $role)
    {
        if ($role->isAutomatic) return false;

        return DynamicPermission::PersonCanEditPermissable($role, $user);
    }

    /**
     * Determine whether the person can delete the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(Person $user, Role $role)
    {
        return DynamicPermission::PersonCanEditPermissable($role, $user);
    }
}
