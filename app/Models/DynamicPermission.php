<?php

namespace App\Models;

use App\Http\Controllers\LogController;
use App\Models\Role as ModelsRole;
use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class DynamicPermission extends Model
{
    use EditsAreLogged;

    protected $fillable = [
        'type',
        'role_id',
        'permissable_type',
        'permissable_id'
    ];

    public function permissable()
    {
        return $this->morphTo();
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public static function createFromRelations(string $type, Model $permissable, Role $role)
    {
        $dynamicPermission = new DynamicPermission(['type' => $type]);
        $dynamicPermission->role()->associate($role);
        $dynamicPermission->permissable()->associate($permissable);
        $dynamicPermission->save();
        return $dynamicPermission;
    }

    public static function PersonCanViewPermissable(Model $permissable, ?Person $person = NULL)
    {
        if (is_null($person)) {

            // Not logged in case
            if (!Auth::check()) {
                return $permissable
                    ->morphMany(DynamicPermission::class, 'permissable')
                    ->where('role_id', Role::findByName('everyone')->id)
                    ->where('type', 'view')
                    ->count() > 0;
            }

            $person = Auth::user();
        }

        if ($permissable instanceof Resource)
            if ($person->hasPermissionTo('resources-view-all'))
                return true;

        if ($permissable instanceof ModelsRole)
            if ($person->hasPermissionTo('roles-view-all'))
                return true;

        if ($permissable instanceof Project)
            if ($person->hasPermissionTo('projects-view-all'))
                return true;

        return $permissable
            ->morphMany(DynamicPermission::class, 'permissable')
            ->whereIn('role_id', $person->allRoles->pluck('id'))
            ->where('type', 'view')
            ->count() > 0;
    }

    public static function PersonCanEditPermissable(Model $permissable, ?Person $id = NULL)
    {
        if (is_null($id)) {

            // Not logged in case
            if (!Auth::check()) {
                return $permissable
                    ->morphMany(DynamicPermission::class, 'permissable')
                    ->where('role_id', Role::findByName('everyone')->id)
                    ->where('type', 'edit')
                    ->count() > 0;
            }


            $id = Auth::user();
        }

        if ($permissable instanceof Resource)
            if ($id->hasPermissionTo('resources-edit-all'))
                return true;

        if ($permissable instanceof ModelsRole)
            if ($id->hasPermissionTo('roles-edit-all'))
                return true;

        if ($permissable instanceof Project)
            if ($id->hasPermissionTo('projects-edit-all'))
                return true;

        return $permissable
            ->morphMany(DynamicPermission::class, 'permissable')
            ->whereIn('role_id', $id->getAllRoles()->pluck('id'))
            ->where('type', 'edit')
            ->count() > 0;
    }

    public static function PersonCanDoOnPermissable(string $action, Model $permissable, ?Person $id = NULL)
    {
        if( $action == 'view' ) return self::PersonCanViewPermissable($permissable, $id);
        if( $action == 'edit' ) return self::PersonCanEditPermissable($permissable, $id);

        if (is_null($id)) return false;

        return $permissable
            ->morphMany(DynamicPermission::class, 'permissable')
            ->whereIn('role_id', $id->getAllRoles()->pluck('id'))
            ->where('type', $action)
            ->count() > 0;
    }

    public function logify()
    {
        return $this->type . " of " . $this->role->name . " for " . LogController::stringify($this->permissable);
    }

    public static function syncPermissions(Model $permissable, string $action, array $new_roles_id) {
        $current_roles = $permissable->morphMany(DynamicPermission::class, 'permissable')->where('type', $action)->get()->pluck('role_id')->toArray();

        foreach (array_diff($current_roles, $new_roles_id) as $role) {
            // Roles to remove
            $permissable->morphMany(DynamicPermission::class, 'permissable')->where('role_id', $role)->where('type', $action)->delete();
        }
        foreach (array_diff($new_roles_id, $current_roles) as $role) {
            // Roles to add
            DynamicPermission::createFromRelations($action, $permissable, Role::findById($role));
        }
    }
}
