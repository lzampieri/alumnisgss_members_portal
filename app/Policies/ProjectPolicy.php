<?php

namespace App\Policies;

use App\Models\DynamicPermission;
use App\Models\Person;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ProjectPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(?Person $person, Project $project): bool
    {
        return DynamicPermission::PersonCanViewPermissable($project, $person);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Person $person): bool
    {
        return $person->hasPermissionTo('projects-create');
    }

    /**
     * Determine whether the user can view the reimbursement in the project.
     */
    public function see(Person $person, Project $project): bool
    {
        return DynamicPermission::PersonCanDoOnPermissable('see',$project, $person);
    }

    /**
     * Determine whether the user can approve reimbursement in the project.
     */
    public function approve(Person $person, Project $project): bool
    {
        return DynamicPermission::PersonCanDoOnPermissable('approve',$project, $person);
    }

    /**
     * Determine whether the user can edit the model.
     */
    public function edit(Person $person, Project $project): bool
    {
        return DynamicPermission::PersonCanEditPermissable($project, $person);
    }
}
