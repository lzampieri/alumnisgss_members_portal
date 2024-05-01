<?php

namespace App\Models;

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

    public function details()
    {
        return $this->morphMany(IdentityDetail::class, 'identity');
    }

    protected $appends = ['enabled'];
    public function getEnabledAttribute()
    {
        return $this->hasPermissionTo('login');
    }

    public function hasPermissionTo($permission, $guardName = null): bool
    {
        return $this->traitHasPermissionTo($permission) || Role::findByName('everyone')->hasPermissionTo($permission);
    }

    public function getAllRoles()
    {
        $roles = $this->roles;
        $roles->push(Role::findByName('everyone'));
        return $roles;
    }
}
