<?php

namespace App\Policies;

use App\Models\LoginMethod;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;

class LoginMethodPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can login.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function login(User $user)
    {
        return $user->hasPermissionTo('login');
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('logins-view');
    }

    /**
     * Determine whether the user can enable models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function enable(User $user)
    {
        return $user->hasPermissionTo('logins-enabling');
    }
}
