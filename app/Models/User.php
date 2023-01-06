<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use SoftDeletes;
    use HasRoles;

    protected $fillable = [
        'email'
    ];

    protected $casts = [
        'last_login' => 'datetime',
    ];    

    public function enabled() {
        return $this->can('login', User::class);
    }

    public function editableRoles() {
        $roles = Role::all();
        $editableRoles = [];

        foreach( $roles as $role ) {
            if( $this->hasPermissionTo( 'user-edit-' . $role->name ) ) {
                $editableRoles[] = $role->name;
            }
        }

        return $editableRoles;
    }

    public function documents() {
        return $this->hasMany( Document::class );
    }
}
