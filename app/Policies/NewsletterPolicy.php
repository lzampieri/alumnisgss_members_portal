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
        return $newsletter->owner()->is($user) || $user->hasPermissionTo('newsletters-master');
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
        return $newsletter->owner()->is($user) || $user->hasPermissionTo('newsletters-master');
    }
}
