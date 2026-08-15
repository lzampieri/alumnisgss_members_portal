<?php

namespace App\Policies;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use App\Models\Person;
use Illuminate\Auth\Access\HandlesAuthorization;

class EmailPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view all emails.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(Person $user)
    {
        return $user->hasPermissionTo('emails-view-all');
    }

    /**
     * Determine whether the person can view an email.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(Person $user, Email $email)
    {
        $person = $email->identity;

        if ($user->hasPermissionTo('emails-view-all'))
            return true;

        if (!$person)
            return false;

        return (new PersonPolicy())->viewEmails($user, $person);
    }

    /**
     * Determine whether the person can edit an instance of the model.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(Person $user, Email $email)
    {
        if($email->identity) {
            return $user->can('editEmails', $email->identity);
        } else {
            return $this->associate($user);
        }
    }

    /**
     * Determine whether the person can delete the models.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Email  $email
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(Person $user, Email $email)
    {
        if($email->identity) {
            return $user->can('editEmails', $email->identity);
        } else {
            return $this->associate($user);
        }
    }

    /**
     * Determine whether the person can associate an email to an identity.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Email  $email
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function associate(Person $user)
    {
        return $user->hasPermissionTo('emails-associate');
    }

    /**
     * Determine whether the person can access the sync tool.
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Email  $email
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function sync(Person $user)
    {
        return $user->hasPermissionTo('emails-sync');
    }
}
