<?php

namespace App\Policies;

use App\Models\Person;
use App\Models\Ticket;
use Illuminate\Auth\Access\HandlesAuthorization;

class TicketPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view any models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(?Person $user)
    {
        return !!$user;
    }

    /**
     * Determine whether the person can view the model.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Ticket  $ticket
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(Person $user, Ticket $ticket)
    {
        return
            $ticket->author()->is($user->identity) ||
            $ticket->assigner()->is($user->identity) ||
            $ticket->instance->canBeSeen($user->identity) ||
            $user->hasPermissionTo('helpdesk-master');
    }

    /**
     * Determine whether the person can create models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(Person $user)
    {
        return true;
    }

    /**
     * Determine whether the person can comment the model.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Ticket $ticket
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function comment(Person $user, Ticket $ticket)
    {
        return
            $ticket->author()->is($user->identity) ||
            $ticket->assigner()->is($user->identity) ||
            $ticket->instance->canBeSeen($user->identity) ||
            $user->hasPermissionTo('helpdesk-master');
    }
}
