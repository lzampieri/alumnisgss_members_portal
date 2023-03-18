<?php

namespace App\Models;

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

    public static function UserCanViewPermissable(Model $permissable, ?Identity $id = NULL )
    {
        if( is_null( $id ) )
            $id = Auth::user()->identity;

        return $permissable
            ->morphMany(DynamicPermission::class, 'permissable')
            ->whereIn('role_id', $id->getAllRoles()->pluck('id') )
            ->where('type', 'view')
            ->count() > 0;
    }

    public static function UserCanEditPermissable(Model $permissable, ?Identity $id = NULL )
    {
        if( is_null( $id ) )
            $id = Auth::user()->identity;

        return $permissable
            ->morphMany(DynamicPermission::class, 'permissable')
            ->whereIn('role_id', $id->getAllRoles()->pluck('id') )
            ->where('type', 'view')
            ->count() > 0;
    }
}
