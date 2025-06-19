<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Auth;

class Email extends Authenticatable
{
    use EditsAreLogged;

    protected $fillable = [
        'address',
        'primary',
        'identity',
        'comment'
    ];

    protected $casts = [
        'last_login' => 'datetime',
        'token_expdate' => 'datetime'
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
