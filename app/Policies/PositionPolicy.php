<?php

namespace App\Policies;

use App\Models\Email;
use App\Models\Position;
use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Auth\User;

class PositionPolicy
{
    /**
     * Determine whether the user can view currently active positions.
     */
    public function viewActive(User $user): bool
    {
        return $user->hasPermissionTo('positions-view-active') || $user->hasPermissionTo('positions-view-all');
    }

    /**
     * Determine whether the user can view currently active and non active positions.
     */
    public function viewAll(User $user): bool
    {
        return $user->hasPermissionTo('positions-view-all');
    }

    /**
     * Determine whether the user can view currently active and non active positions.
     */
    public function edit(User $user): bool
    {
        return $user->hasPermissionTo('positions-edit');
    }

    // /**
    //  * Determine whether the user can create models.
    //  */
    // public function create(User $user): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the user can update the model.
    //  */
    // public function update(User $user, Position $position): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the user can delete the model.
    //  */
    // public function delete(User $user, Position $position): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the user can restore the model.
    //  */
    // public function restore(User $user, Position $position): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the user can permanently delete the model.
    //  */
    // public function forceDelete(User $user, Position $position): bool
    // {
    //     return false;
    // }
}
