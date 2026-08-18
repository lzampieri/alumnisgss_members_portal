<?php

namespace App\Policies;

use App\Models\Permalink;
use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\Person;
use Illuminate\Support\Facades\Auth;

class PermalinkPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can create models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(Person $user)
    {
        return Auth::check();
    }
}
