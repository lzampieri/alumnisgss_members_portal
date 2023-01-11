<?php

namespace App\Models;

use Spatie\Permission\Models\Role;

class Alumnus extends Identity
{
    // Available status
    const status = ['member', 'student_member', 'not_reached', 'student_not_reached', 'student_not_agreed', 'hasnt_right', 'dead', 'not_agreed'];
    // Public visible status
    const public_status = ['member', 'student_member'];


    protected $fillable = [
        'name',
        'surname',
        'coorte',
        'status'
    ];

    public function hasPermissionTo($permission, $guardName = null): bool
    {
        return parent::hasPermissionTo($permission) || $this->checkMemberRole($permission);
    }

    public function checkMemberRole($permission)
    {
        if( $this->status == 'member' && Role::findByName('member')->hasPermissionTo($permission) ) return true;
        if( $this->status == 'student_member' && Role::findByName('student_member')->hasPermissionTo($permission) ) return true;
        return false;
    }
}
