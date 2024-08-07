<?php
namespace App\Models;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use App\Traits\EditsAreLogged;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole {
    use EditsAreLogged;

    public function givePermissionTo(...$permissions) {
        foreach( $permissions as $permission ) {
            LogController::log( LogEvents::PERMISSION_GIVEN, $this, 'permission', Null, $permission );
            parent::givePermissionTo($permission);
        }
    }
    public function revokePermissionTo($permission) {
        LogController::log( LogEvents::PERMISSION_REVOKEN, $this, 'permission', $permission );
        parent::revokePermissionTo($permission);
    }

}