<?php

namespace App\Policies;

use Illuminate\Foundation\Auth\User;
use App\Models\Ticket;
use Illuminate\Auth\Access\HandlesAuthorization;

class TicketPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(?User $user)
    {
        return !!$user;
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Ticket  $ticket
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Ticket $ticket)
    {
        return
            $ticket->author()->is( $user->identity ) ||
            $ticket->assigner()->is( $user->identity ) ||
            $ticket->instance->canBeSeen( $user->identity ) ||
            $user->hasPermissionTo('helpdesk-master');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can comment the model.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Ticket $ticket
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function comment(User $user, Ticket $ticket)
    {
        return
            $ticket->author()->is( $user->identity ) ||
            $ticket->assigner()->is( $user->identity ) ||
            $ticket->instance->canBeSeen( $user->identity ) ||
            $user->hasPermissionTo('helpdesk-master');
    }
}
