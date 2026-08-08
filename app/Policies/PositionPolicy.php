<?php

namespace App\Policies;

use App\Models\Email;
use App\Models\Position;
use Illuminate\Auth\Access\Response;
use App\Models\Person;

class PositionPolicy
{
    /**
     * Determine whether the person can view currently active positions.
     */
    public function viewActive(Person $user): bool
    {
        return $user->hasPermissionTo('positions-view-active') || $user->hasPermissionTo('positions-view-all');
    }

    /**
     * Determine whether the person can view currently active and non active positions.
     */
    public function viewAll(Person $user): bool
    {
        return $user->hasPermissionTo('positions-view-all');
    }

    /**
     * Determine whether the person can view currently active and non active positions.
     */
    public function edit(Person $user): bool
    {
        return $user->hasPermissionTo('positions-edit');
    }

    // /**
    //  * Determine whether the person can create models.
    //  */
    // public function create(Person $user): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the person can update the model.
    //  */
    // public function update(Person $user, Position $position): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the person can delete the model.
    //  */
    // public function delete(Person $user, Position $position): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the person can restore the model.
    //  */
    // public function restore(Person $user, Position $position): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the person can permanently delete the model.
    //  */
    // public function forceDelete(Person $user, Position $position): bool
    // {
    //     return false;
    // }
}
