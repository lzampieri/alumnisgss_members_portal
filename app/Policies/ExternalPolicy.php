<?php

namespace App\Policies;

use App\Models\External;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExternalPolicy
{
    use HandlesAuthorization;


    /**
     * Determine whether the user can enable models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function enable(User $user)
    {
        return $user->hasPermissionTo('identity-externals-enabling');
    }
}
