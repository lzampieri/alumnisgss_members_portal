<?php

namespace App\Policies;

use App\Models\Alumnus;
use App\Models\Person;
use Illuminate\Auth\Access\HandlesAuthorization;

class PersonPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view the people which are alumnus
     * and whose status is in Alumnus::public_status
     *
     * @param  \App\Models\Person  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewPublicStatus(?Person $user)
    {
        return true; // Everyone can see the list of members!
    }

    /**
     * Determine whether the person can view all the alumnus, with all the details
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAnyAlumnus(Person $user)
    {
        return $user->hasPermissionTo('people-alumnus-view-all');
    }

    /**
     * Determine whether the person can view all the externals, with all the details
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAnyExternal(Person $user)
    {
        return $user->hasPermissionTo('people-externals-view-all');
    }


    /**
     * Determine whether the person can view himself, and its details.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewHimself(Person $user)
    {
        return true; // TODO implement for externals!!
    }


    /**
     * Determine whether the person can view an alumnus withOUT details
     * Warning: this permission is rewritten with more efficiency in NetworkController::list
     *
     * @param  \App\Models\Person  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewGeneral(Person $user, Person $person)
    {
        if (!$person->is_alumnus) return $this->viewAnyExternal($user);

        if (in_array($person->status, Alumnus::public_status)) return true;

        return $this->viewAnyAlumnus($user);
    }

    /**
     * Determine whether the person can view the DETAILS for a specific PERSON
     *
     * @param  \App\Models\Person $user
     * @param  \App\Models\Person $person
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewDetails(Person $user, ?Person $person = null)
    {
        // For creation
        if( !$person ) return $user->hasPermissionTo('people-view-alldetails');
        
        // Externals are not included in the network stuff
        if (!$person->is_alumnus) return false;
        if ($user->hasPermissionTo('people-view-alldetails')) return true;
        if ($user->hasPermissionTo('network-view') && $person->consent_to_network_share) return true;
        return false;
    }

    /**
     * Determine whether the person can edit the settings for the network visualization
     *
     * @param  \App\Models\Person  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editNetworkView(Person $user)
    {
        return $user->hasPermissionTo('network-edit-view');
    }

    /**
     * Determine whether the person can edit a person profile,
     * relative to the general details (first name, last name, etc.)
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Person  $person
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editGeneral(Person $user, ?Person $person = null)
    {
        return true;
        if (!$person) return $user->hasPermissionTo('people-edit-general');
        return $this->viewGeneral($user, $person) && $user->hasPermissionTo('people-edit-general');
    }

    /**
     * Determine whether the person can edit a person profile,
     * relative to the consents flags
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Person  $person
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editConsent(Person $user, ?Person $person = null)
    {
        if (!$person) return $user->hasPermissionTo('people-edit-consent');
        return $this->viewGeneral($user, $person) && $user->hasPermissionTo('people-edit-consent');
    }

    /**
     * Determine whether the person can edit a person profile,
     * relative to the networking details
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Person  $person
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editDetails(Person $user, ?Person $person = null)
    {
        if (!$person) return $user->hasPermissionTo('people-edit-details');
        return $this->viewDetails($user, $person) && $user->hasPermissionTo('people-edit-details');
    }

    /**
     * Determine whether the person can create a new person.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(Person $user)
    {
        return $user->hasPermissionTo('people-edit-general');
    }

    /**
     * Determine whether the person can edit models in bulk.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function import(Person $user)
    {
        return $user->hasPermissionTo('people-alumnus-import');
    }

    /**
     * Determine whether the person can enable models.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function enable(Person $user)
    {
        return $user->hasPermissionTo('people-enabling');
    }

    // -------------------------------------------------
    //             Login and logout
    // -------------------------------------------------


    /**
     * Determine if the user can login
     *
     * @param  \App\Models\Person $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function login(Person $user)
    {
        return $user->hasPermissionTo('login');
    }

    /**
     * Determine whether the person can login at level 2.
     *
     * @param  \App\Models\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function login_lv2(Person $user)
    {
        return  $user->hasPermissionTo('login') && $user->hasPermissionTo('login-lv2');
    }
}
