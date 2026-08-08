<?php

namespace App\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\Person;

class RatificationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view any models.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(Person $user)
    {
        return $user->hasPermissionTo('ratifications-view');
    }

    /**
     * Determine whether the person can add any models.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(Person $user)
    {
        return $user->hasPermissionTo('ratifications-edit');
    }
}
