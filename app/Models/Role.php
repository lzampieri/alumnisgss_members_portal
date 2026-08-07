<?php
namespace App\Models;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use App\Http\Controllers\PermissionsController;
use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Exceptions\RoleDoesNotExist;
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

    static function findByNameOrNull($name) {
        try {
            return self::findByName($name);
        } catch (RoleDoesNotExist $e) {
            return null;
        }
    }

    public function hasDynamicPermissions()
    {
        return $this->hasMany(DynamicPermission::class,"role_id");
    }
    public function permissableViaDynamicPermissions()
    {
        return $this->morphMany(DynamicPermission::class,"permissable");
    }

    protected function isAutomatic(): Attribute {
        return Attribute::make( get: fn (mixed $_, array $attributes) => in_array( $attributes['name'], PermissionsController::getAutomaticRoles()[0] ) );
    }

    protected function canView(): Attribute {
        return Attribute::make( get: fn () => Auth::check() && Auth::user()->can('view',$this) );
    }

    protected function canEdit(): Attribute {
        return Attribute::make( get: fn () => Auth::check() && Auth::user()->can('edit',$this) );
    }
}