<?php

namespace App\Policies;

use App\Models\Stamp;
use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\Person;

class StampPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view any models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(Person $user)
    {
        return $user->hasPermissionTo('clockin-view-all');
    }

    /**
     * Determine whether the person can view the model.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(Person $user, Stamp $stamp)
    {
        return $stamp->employee->is($user) || $user->hasPermissionTo('clockin-view-all');
    }

    /**
     * Determine whether the person can view the people which are currently in service.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewOnline(Person $user)
    {
        return  $user->hasPermissionTo('clockin-view-online') || $user->hasPermissionTo('clockin-view-all');
    }

    /**
     * Determine whether the person can clock-in.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function clockin(Person $user)
    {
        return $user->hasPermissionTo('clockin');
    }

    /**
     * Determine whether the person can edit his stamps.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editMine(Person $user)
    {
        return $user->hasPermissionTo('clockin');
    }

    /**
     * Determine whether the person can edit his stamps.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delSpecial(Person $user, Stamp $stamp)
    {
        return $stamp->employee->is($user) || $user->hasPermissionTo('clockin-edit-all');
    }

    /**
     * Determine whether the person can edit stamps.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(Person $user)
    {
        return $user->hasPermissionTo('clockin-edit-all');
    }

    /**
     * Determine whether the person can edit the note on stamps.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editNote(Person $user, Stamp $stamp)
    {
        return $stamp->employee->is($user) || $user->hasPermissionTo('clockin-edit-all');
    }
}
