<?php

namespace App\Policies;

use App\Models\Email;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;

class EmailPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can login.
     *
     * @param  \Illuminate\Support\Facades\Auth\User $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function login(User $user)
    {
        return $user->hasPermissionTo('login');
    }
    
    /**
     * Determine whether the user can login at level 2.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function upgrade_login(User $user)
    {
        return  $user->hasPermissionTo('login') && $user->hasPermissionTo('upgrade-login');
    }

    /**
     * Determine whether the user can view all emails.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('emails-view-all');
    }

    /**
     * Determine whether the user can add a new instance of the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function add(User $user)
    {
        return $user->hasPermissionTo('emails-add');
    }

    /**
     * Determine whether the user can delete the models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Email  $email
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Email $email)
    {
        if ($user->hasPermissionTo('emails-delete'))
            return true;

        if ($email->identity && $email->identity->is($user))
            return true;

        return false;
    }

    /**
     * Determine whether the user can associate an email to an identity.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Email  $email
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function associate(User $user)
    {
        return $user->hasPermissionTo('emails-associate');
    }
}
