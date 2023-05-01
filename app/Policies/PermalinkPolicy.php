<?php

namespace App\Policies;

use App\Models\Permalink;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Auth;

class PermalinkPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Permalink  $permalink
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Permalink $permalink)
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return Auth::check();
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Permalink  $permalink
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Permalink $permalink)
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Permalink  $permalink
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Permalink $permalink)
    {
        return false;
    }
}
