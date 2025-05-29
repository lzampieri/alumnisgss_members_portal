<?php

namespace App\Policies;

use App\Models\Alumnus;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User;

class AlumnusPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the REGISTERED MEMBERS with only BASIC DETAILS
     *
     * @param  \Illuminate\Foundation\Auth\User  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewMembers(?User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view all the alumnus (members or not), with all the details
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('alumnus-view');
    }

    /**
     * Determine whether the user can view himself, and its details.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewHimself(User $user)
    {
        return $user->identity_type == Alumnus::class;
    }

    /**
     * Determine whether the user can view the REGISTERED MEMBERS
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewNetwork(User $user)
    {
        return $user->hasPermissionTo('network-view');
    }

    /**
     * Determine whether the user can view the details for a specific ALUMNUS
     *
     * @param  \Illuminate\Foundation\Auth\User $user
     * @params \App\Models\Alumnus $alumnus
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewNetworkDetails(User $user, Alumnus $alumnus)
    {
        // if( $user->hasPermissionTo('network-view-alldetails') ) return true;
        if ($user->hasPermissionTo('network-view') && $alumnus->consent_to_network_share) return true;
        return false;
    }

    /**
     * Determine whether the user can edit the settings for the network visualization
     *
     * @param  \Illuminate\Foundation\Auth\User  $user optional
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editNetworkView(User $user)
    {
        return $user->hasPermissionTo('network-edit-view');
    }

    /**
     * Determine whether the user can edit an alumnus profile, limiting to the details of the network visualization
     *
     * @param  \Illuminate\Foundation\Auth\User  $user optional
     * @param  \App\Models\Alumnus  $alumnus
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function editNetworkAlumnus(User $user, Alumnus $alumnus)
    {
        if( $user->hasPermissionTo('network-edit-alumnus') ) return true;
        if( $user->hasPermissionTo('network-edit-consenting-alumnus') && $alumnus->consent_to_network_share ) return true;
        return false;
    }


    /**
     * Determine whether the user can edit any alumnus (member or not).
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user)
    {
        return $user->hasPermissionTo('alumnus-edit');
    }

    /**
     * Determine whether the user can edit models in bulk.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function import(User $user)
    {
        return $user->hasPermissionTo('alumnus-import');
    }

    /**
     * Determine whether the user can enable models.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function enable(User $user)
    {
        return $user->hasPermissionTo('identity-alumni-enabling');
    }

    /**
     * Determine whether the user can assign status which usually requires ratification.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    // public function bypassRatification(User $user)
    // {
    //     return $user->hasPermissionTo('ratifications-bypass');
    // }
    // THE PERMISSION bypassRatification HAS BEEN REMOVED
}
