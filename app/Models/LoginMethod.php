<?php

namespace App\Models;

use App\Http\Controllers\LogEvents;
use App\Traits\EditsAreLogged;
use Illuminate\Contracts\Auth\Access\Authorizable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Auth;

class LoginMethod extends Authenticatable
{
    use EditsAreLogged;
    
    public static $drivers = ['google'];
    
    protected $fillable = [
        'driver',
        'credential',
        'identity',
        'comment'
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

    public function lev2_loggedin() {
        return Auth::check() && Auth::user()->is( $this ) && $this->token && $this->token_expdate > now();
    }
}
