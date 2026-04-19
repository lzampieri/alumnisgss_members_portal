<?php

namespace App\Policies;

use Illuminate\Foundation\Auth\User;
use App\Models\Newsletter;
use Illuminate\Auth\Access\HandlesAuthorization;

class NewsletterPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view all the models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Newsletter  $newsletter
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAll(User $user)
    {
        return $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Newsletter  $newsletter
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Newsletter $newsletter)
    {
        return $newsletter->owner()->is($user->identity) || $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('newsletters-create') || $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, Newsletter $newsletter)
    {
        if( $newsletter->sent_at ) return false;
        if( $newsletter->from == 'SMTP' ) return false; // newsletter already scheduled to be sent
        return $newsletter->owner()->is($user->identity) || $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the user can send the newsletter.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function send(User $user, Newsletter $newsletter)
    {
        if( !$this->edit($user, $newsletter) ) return false;
        return $user->hasPermissionTo('newsletters-send');
    }

    /**
     * Determine whether the user can send the newsletter via STMP server.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function sendServer(User $user, Newsletter $newsletter)
    {
        if( !$this->edit($user, $newsletter) ) return false;
        return $user->hasPermissionTo('newsletters-send-server');
    }
}
