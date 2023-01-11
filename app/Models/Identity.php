<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

abstract class Identity extends Model {
    // This is a fake model, cannot be instantiated,
    // and is not directly connected to a table!
    // Is only useful to collect all the possible
    // kinds of authenticated identities

    use HasRoles;

    protected $guard_name = 'web';

    public function editableRoles() {
        if( !Auth::check() ) return [];
        
        $roles = Role::all();
        $editableRoles = [];

        foreach( $roles as $role ) {
            if( $this->hasPermissionTo( 'user-edit-' . $role->name ) ) {
                $editableRoles[] = $role->name;
            }
        }

        return $editableRoles;
    }
    
    public function loginMethods() {
        return $this->morphMany( LoginMethod::class, 'identity' );
    }

    public function documents() {
        return $this->morphMany( Document::class, 'author' );
    }

    protected $appends = ['enabled'];
    public function getEnabledAttribute() {
        return $this->hasPermissionTo('login');
    }
}