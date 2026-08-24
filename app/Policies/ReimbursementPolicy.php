<?php

namespace App\Policies;

use App\Models\Person;
use App\Models\Reimbursement;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Auth;

class ReimbursementPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(Person $person, Reimbursement $reimbursement): bool
    {
        // The author can always see the reimbursement
        if( $reimbursement->author->is($person) )
            return true;

        // If the person has permission to see all reimbursements
        if( $person->hasPermissionTo('reimbursements-view-all') )
            return true;

        $project = $reimbursement->project;
        if( $project ) {
            // If the reimbursement has been sent, it should be seen by the
            // people able to see the project and to approve it
            if( $reimbursement->sent )
                return $person->can('see',$project) || $person->can('approve', $project);
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Person $person): bool
    {
        return Auth::check(); // In principle, anyone logged in can create reimbursements
    }

    /**
     * Determine whether the user can edit the model, if it is a draft.
     */
    public function edit(Person $person, Reimbursement $reimbursement): bool
    {
        return !( $reimbursement->sent ) && $reimbursement->author->is($person);
    }
}
