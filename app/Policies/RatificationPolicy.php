<?php

namespace App\Policies;

use App\Models\Ratification;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;

class RatificationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user)
    {
        return $user->hasPermissionTo('ratifications-view');
    }

    /**
     * Determine whether the user can add any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user)
    {
        return $user->hasPermissionTo('ratifications-edit');
    }
}
