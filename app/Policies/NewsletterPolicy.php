<?php

namespace App\Policies;

use App\Models\Person;
use App\Models\Newsletter;
use Illuminate\Auth\Access\HandlesAuthorization;

class NewsletterPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view all the models.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Newsletter  $newsletter
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAll(Person $user)
    {
        return $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the person can view the model.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Newsletter  $newsletter
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(Person $user, Newsletter $newsletter)
    {
        return $newsletter->owner()->is($user) || $user->hasPermissionTo('newsletters-view-all') || $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the person can create models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(Person $user)
    {
        return $user->hasPermissionTo('newsletters-create') || $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the person can create models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(Person $user, Newsletter $newsletter)
    {
        if ($newsletter->sent_at) return false;
        if ($newsletter->from == 'SMTP') return false; // newsletter already scheduled to be sent
        return $newsletter->owner()->is($user) || $user->hasPermissionTo('newsletters-master');
    }

    /**
     * Determine whether the person can send the newsletter.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function send(Person $user, Newsletter $newsletter)
    {
        if (!$this->edit($user, $newsletter)) return false;
        return $user->hasPermissionTo('newsletters-send');
    }

    /**
     * Determine whether the person can send the newsletter via STMP server.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function sendServer(Person $user, Newsletter $newsletter)
    {
        if (!$this->edit($user, $newsletter)) return false;
        return $user->hasPermissionTo('newsletters-send-server');
    }

    /**
     * Determine whether the person can delete models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(Person $user, Newsletter $newsletter)
    {
        if ($newsletter->sent_at) return false;
        if ($newsletter->from == 'SMTP') return false; // newsletter already scheduled to be sent
        return $newsletter->owner()->is($user) || $user->hasPermissionTo('newsletters-master');
    }
}
