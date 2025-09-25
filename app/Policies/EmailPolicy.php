<?php

namespace App\Policies;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
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
    public function login_lv2(User $user)
    {
        return  $user->hasPermissionTo('login') && $user->hasPermissionTo('login-lv2');
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
     * Determine whether the user can view an email.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view (User $user, Email $email)
    {
        if( $email->identity && $email->identity->is($user->identity) )
            return true;
        if( $user->hasPermissionTo('emails-view-all') )
            return true;
        if( $email->identity ) {
            if( $email->identity_type == External::class )
                if( $user->hasPermissionTo('emails-view-external') )
                    return true;

            if( $email->identity_type == Alumnus::class )
                if( in_array( $email->identity->status, Alumnus::public_status ) )
                    if( $user->hasPermissionTo('emails-view-public-alumnus') )
                        return true;
        }

        return false;
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
     * Determine whether the user can edit an instance of the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, Email $email)
    {
        if ($user->hasPermissionTo('emails-edit'))
            return true;

        if ($email->identity && $email->identity->is($user->identity))
            return true;

        return false;
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

        if ($email->identity && $email->identity->is($user->identity))
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

    /**
     * Determine whether the user can access the sync tool.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Email  $email
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function sync(User $user)
    {
        return $user->hasPermissionTo('emails-sync');
    }
}
