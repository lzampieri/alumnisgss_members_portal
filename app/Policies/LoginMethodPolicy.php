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
     * Determine whether the user can edit the models.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\LoginMethod  $lmth
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, LoginMethod $lmth)
    {
        if( $user->hasPermissionTo('logins-edit') )
            return true;

        if( $lmth->identity )
            if( $lmth->identity_type == $user->identity_type )
                if( $lmth->identity_id == $user->identity_id )
                    return true;

        return false;
    }

    /**
     * Determine whether the user can associate a login method to an identity.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\LoginMethod  $lmth
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function associate(User $user)
    {
        return $user->hasPermissionTo('accesses-associate');
    }
}
