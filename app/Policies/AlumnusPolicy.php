<?php

namespace App\Policies;

use App\Models\Alumnus;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

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
        return $user->hasPermissionTo( 'alumnus-view' );
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Alumnus  $alumnus
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function view(User $user, Alumnus $alumnus)
    // {
    //     //
    // }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user)
    {
        return $user->hasPermissionTo( 'alumnus-edit' );
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Alumnus  $alumnus
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function update(User $user, Alumnus $alumnus)
    // {
    //     //
    // }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Alumnus  $alumnus
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function delete(User $user, Alumnus $alumnus)
    // {
    //     //
    // }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Alumnus  $alumnus
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function restore(User $user, Alumnus $alumnus)
    // {
    //     //
    // }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Alumnus  $alumnus
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function forceDelete(User $user, Alumnus $alumnus)
    // {
    //     //
    // }
}
