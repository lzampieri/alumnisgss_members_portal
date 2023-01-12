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
     * @param  \App\Models\User  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewMembers(?User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('alumnus-view');
    }

    /**
     * Determine whether the user can edit models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user)
    {
        return $user->hasPermissionTo('alumnus-edit');
    }

    /**
     * Determine whether the user can edit models in bulk.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function bulkEdit(User $user)
    {
        return $user->hasPermissionTo('alumnus-bulk');
    }

    /**
     * Determine whether the user can enable models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function enable(User $user)
    {
        return $user->hasPermissionTo('identity-alumni-enabling');
    }

    /**
     * Determine whether the user can assign status which usually requires ratification.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function bypassRatification(User $user)
    {
        return $user->hasPermissionTo('ratifications-bypass');
    }
}
