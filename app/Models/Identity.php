<?php

namespace App\Models;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

abstract class Identity extends Model
{
    // This is a fake model, cannot be instantiated,
    // and is not directly connected to a table!
    // Is only useful to collect all the possible
    // kinds of authenticated identities

    use HasRoles {
        hasPermissionTo as protected traitHasPermissionTo;
        givePermissionTo as protected traitGivePermissionTo;
        revokePermissionTo as protected traitRevokePermissionTo;
        assignRole as protected traitAssignRole;
        removeRole as protected traitRemoveRole;
    }

    // hasPermissionTo is overrided to include the 'everyone' case
    public function hasPermissionTo($permission, $guardName = null): bool
    {
        return $this->traitHasPermissionTo($permission) || Role::findByName('everyone')->hasPermissionTo($permission);
    }

    // Some of the trait method are overrided for logging purpose
    public function givePermissionTo(...$permissions) {
        foreach ($permissions as $permission) {
            LogController::log( LogEvents::PERMISSION_GIVEN, $this, 'permission', null, $permission );
            $this->traitGivePermissionTo($permission);
        }
    }
    public function revokePermissionTo(...$permissions) {
        foreach ($permissions as $permission) {
            LogController::log( LogEvents::PERMISSION_REVOKEN, $this, 'permission', $permission );
            $this->traitRevokePermissionTo($permission);
        }
    }
    public function assignRole(...$roles) {
        foreach ($roles as $role) {
            LogController::log( LogEvents::ROLE_GIVEN, $this, 'role', null, $role );
            $this->traitAssignRole($role);
        }
    }
    public function removeRole(...$roles) {
        foreach ($roles as $role) {
            LogController::log( LogEvents::ROLE_REVOKEN, $this, 'role', $role );
            $this->traitRemoveRole($role);
        }
    }

    protected $guard_name = 'web';

    public function editableRoles()
    {
        if (!Auth::check()) return [];

        $roles = Role::all();
        $editableRoles = [];

        foreach ($roles as $role) {
            if ($role->name == 'member' || $role->name == 'student_member' || $role->name == 'everyone') continue;
            if ($this->hasPermissionTo('user-edit-' . $role->name)) {
                $editableRoles[] = $role;
            }
        }

        return $editableRoles;
    }

    public function surnameAndName()
    {
        return $this->surname . " " . $this->name;
    }

    public function loginMethods()
    {
        return $this->morphMany(LoginMethod::class, 'identity');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'author');
    }
    
    public function stamps()
    {
        return $this->morphMany(Stamp::class, 'employee');
    }

    public function aDetails()
    {
        return $this->morphMany(ADetail::class, 'identity');
    }
    public function getADetailsKeydAttribute()
    {
        return $this->getRelationValue('aDetails')->keyBy('a_details_type_id');
    }

    protected $appends = ['enabled'];
    public function getEnabledAttribute()
    {
        return $this->hasPermissionTo('login');
    }

    public function getAllRoles()
    {
        $roles = $this->roles;
        $roles->push(Role::findByName('everyone'));
        return $roles;
    }
}
