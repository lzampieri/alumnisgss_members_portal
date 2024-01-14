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
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function login(User $user)
    {
        return $user->hasPermissionTo('login');
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('logins-view');
    }

    /**
     * Determine whether the user can add a new instance of the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function add(User $user)
    {
        return $user->hasPermissionTo('logins-add');
    }

    /**
     * Determine whether the user can delete the models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\LoginMethod  $lmth
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, LoginMethod $lmth)
    {
        if ($user->hasPermissionTo('logins-delete'))
            return true;

        if ($lmth->identity)
            if ($lmth->identity_type == $user->identity_type)
                if ($lmth->identity_id == $user->identity_id)
                    return true;

        return false;
    }

    /**
     * Determine whether the user can associate a login method to an identity.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\LoginMethod  $lmth
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function associate(User $user)
    {
        return $user->hasPermissionTo('accesses-associate');
    }
}
