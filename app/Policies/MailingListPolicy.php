<?php

namespace App\Policies;

use App\Models\DynamicPermission;
use App\Models\Email;
use App\Models\MailingList;
use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\Person;
use Illuminate\Auth\Access\Response;

class MailingListPolicy
{
    /**
     * Determine whether the person can view the model.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\MailingList  $mailingList
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(Person $user, MailingList $mailingList): bool
    {
        if ($user->hasPermissionTo('mailinglists-view-all'))
            return true;
        return (DynamicPermission::PersonCanViewPermissable($mailingList, $user) || DynamicPermission::PersonCanEditPermissable($mailingList, $user));
    }

    /**
     * Determine whether the person can create models.
     */
    public function create(Person $user): bool
    {
        return $user->hasPermissionTo('mailinglists-create');
    }

    /**
     * Determine whether the person can update the model.
     */
    public function edit(Person $user, MailingList $mailingList): bool
    {
        if ($user->hasPermissionTo('mailinglists-edit-all'))
            return true;
        return DynamicPermission::PersonCanEditPermissable($mailingList, $user);
    }
}
