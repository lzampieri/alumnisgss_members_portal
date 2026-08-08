<?php

namespace App\Policies;

use App\Models\City;
use App\Models\Email;
use Illuminate\Auth\Access\Response;
use App\Models\Person;

class CityPolicy
{
    /**
     * Determine whether the person can view all the cities, without details
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAll(Person $user)
    {
        return $user->hasPermissionTo('network-view');
    }

    /**
     * Determine whether the person can edit the cities
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(Person $user)
    {
        return $user->hasPermissionTo('cities-edit');
    }
}
