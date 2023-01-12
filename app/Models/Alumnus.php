<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class Alumnus extends Identity
{
    // Available status
    const status = ['member', 'student_member', 'not_reached', 'student_not_reached', 'student_not_agreed', 'hasnt_right', 'dead', 'not_agreed'];
    // Public visible status
    const public_status = ['member', 'student_member'];
    // Status which can be assigned only using ratification
    const require_ratification = ['member', 'student_member'];
    // Assignable status
    public static function availableStatus(Alumnus $alumnus = null) {
        if (Auth::user()->can('bypassRatification', Alumnus::class))
            $availableStatus = Alumnus::status;
        else
            $availableStatus = array_diff(Alumnus::status, Alumnus::require_ratification);
        if( $alumnus && !in_array( $alumnus->status, $availableStatus ) )
            $availableStatus[] = $alumnus;
        return array_values( $availableStatus );
    }


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

    public function ratifications() {
        return $this->hasMany( Ratification::class );
    }
}
