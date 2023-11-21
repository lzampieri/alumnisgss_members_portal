<?php

namespace App\Policies;

use App\Models\AwsSession;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AwsSessionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('aws-session-view');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(?User $user)
    {
        return true;
    }
}
