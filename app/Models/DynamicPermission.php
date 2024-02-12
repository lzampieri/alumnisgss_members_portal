<?php

namespace App\Models;

use App\Http\Controllers\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class DynamicPermission extends Model
{
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

    public static function UserCanViewPermissable(Model $permissable, ?Identity $id = NULL)
    {
        if (is_null($id)) {

            // Not logged in case
            if (!Auth::check()) {
                return $permissable
                    ->morphMany(DynamicPermission::class, 'permissable')
                    ->where('role_id', Role::findByName('everyone')->id)
                    ->where('type', 'view')
                    ->count() > 0;
            }


            $id = Auth::user()->identity;
        }

        if ($id->hasRole(Role::findByName('webmaster')))
            return true;

        return $permissable
            ->morphMany(DynamicPermission::class, 'permissable')
            ->whereIn('role_id', $id->getAllRoles()->pluck('id'))
            ->where('type', 'view')
            ->count() > 0;
    }

    public static function UserCanEditPermissable(Model $permissable, ?Identity $id = NULL)
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


            $id = Auth::user()->identity;
        }

        if ($id->hasRole(Role::findByName('webmaster')))
            return true;

        return $permissable
            ->morphMany(DynamicPermission::class, 'permissable')
            ->whereIn('role_id', $id->getAllRoles()->pluck('id'))
            ->where('type', 'edit')
            ->count() > 0;
    }
}
