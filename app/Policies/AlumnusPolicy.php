<?php

namespace App\Policies;

use App\Models\Alumnus;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;

class AlumnusPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the REGISTERED MEMBERS with only BASIC DETAILS
     *
     * @param  \Illuminate\Foundation\Auth\User  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewMembers(?User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view the REGISTERED MEMBERS with ALL DETAILS
     *
     * @param  \Illuminate\Foundation\Auth\User  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewNetwork(?User $user)
    {
        return $user->hasPermissionTo('network-view');
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('alumnus-view');
    }

    /**
     * Determine whether the user can edit models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user)
    {
        return $user->hasPermissionTo('alumnus-edit');
    }

    /**
     * Determine whether the user can edit models in bulk.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function import(User $user)
    {
        return $user->hasPermissionTo('alumnus-import');
    }

    /**
     * Determine whether the user can enable models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function enable(User $user)
    {
        return $user->hasPermissionTo('identity-alumni-enabling');
    }

    /**
     * Determine whether the user can assign status which usually requires ratification.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function bypassRatification(User $user)
    // {
    //     return $user->hasPermissionTo('ratifications-bypass');
    // }
    // THE PERMISSION bypassRatification HAS BEEN REMOVED
}
