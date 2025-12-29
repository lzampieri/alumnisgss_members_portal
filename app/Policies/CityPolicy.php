<?php

namespace App\Policies;

use App\Models\City;
use App\Models\Email;
use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Auth\User;

class CityPolicy
{
    /**
     * Determine whether the user can view all the cities, without details
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAll(User $user)
    {
        return $user->hasPermissionTo('network-view');
    }

    /**
     * Determine whether the user can edit the cities
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user)
    {
        return $user->hasPermissionTo('cities-edit');
    }
}
