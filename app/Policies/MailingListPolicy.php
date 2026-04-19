<?php

namespace App\Policies;

use App\Models\DynamicPermission;
use App\Models\Email;
use App\Models\MailingList;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\Response;

class MailingListPolicy
{
    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\MailingList  $mailingList
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, MailingList $mailingList): bool
    {
        if( $user->hasPermissionTo('mailinglists-view-all') )
            return true;
        return ( DynamicPermission::UserCanViewPermissable($mailingList, $user) || DynamicPermission::UserCanEditPermissable($mailingList, $user) );
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('mailinglists-create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function edit(User $user, MailingList $mailingList): bool
    {
        if( $user->hasPermissionTo('mailinglists-edit-all') )
            return true;
        return DynamicPermission::UserCanEditPermissable($mailingList, $user);
    }
}
