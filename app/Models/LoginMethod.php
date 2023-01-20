<?php

namespace App\Models;

use App\Http\Controllers\Log;
use Illuminate\Contracts\Auth\Access\Authorizable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class LoginMethod extends Authenticatable
{
    public static $drivers = ['google'];
    
    protected $fillable = [
        'driver',
        'credential',
        'identity'
    ];

    protected $casts = [
        'last_login' => 'datetime',
    ];

    public function identity()
    {
        return $this->morphTo();
    }

    public function hasPermissionTo($permission)
    {
        return $this->identity && $this->identity->hasPermissionTo($permission);
    }

    public function hasRole($role)
    {
        return $this->identity && $this->identity->hasRole($role);
    }

    public function enabled() {
        return $this->hasPermissionTo('login');
    }
    
    public function blocks() {
        return $this->morphMany( Block::class, 'blockable' );
    }
}
