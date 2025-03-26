<?php

namespace App\Policies;

use App\Models\Stamp;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;

class StampPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('clockin-view-all');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Stamp $stamp)
    {
        return $stamp->employee->is($user) || $user->hasPermissionTo('clockin-view-all');
    }

    /**
     * Determine whether the user can view the people which are currently in service.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewOnline(User $user)
    {
        return  $user->hasPermissionTo('clockin-view-online') || $user->hasPermissionTo('clockin-view-all');
    }

    /**
     * Determine whether the user can clock-in.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function clockin(User $user)
    {
        return $user->hasPermissionTo('clockin');
    }

    /**
     * Determine whether the user can edit his stamps.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editMine(User $user)
    {
        return $user->hasPermissionTo('clockin');
    }

    /**
     * Determine whether the user can edit his stamps.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, Stamp $stamp)
    {
        return $stamp->employee->is($user->identity) || $user->hasPermissionTo('clockin-edit-all');
    }
}
