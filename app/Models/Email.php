<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    use EditsAreLogged;

    protected $fillable = [
        'address',
        'primary',
        'comment'
    ];

    protected $visible = [
        'id',
        'address',
        'primary',
        'comment'
    ];

    protected $casts = [
        'last_login' => 'datetime',
        'token_expdate' => 'datetime',
        'otp_expiration' => 'datetime'
    ];

    public function identity()
    {
        return $this->belongsTo(Person::class, 'identity_id');
    }

    public function lev2_loggedin_thisaddress() {
        return $this->token && $this->token_expdate > now();
    }

    public function getCanDeleteAttribute() {
        return Auth::check() && Auth::user()->can('delete', $this);
    }
    public function getCanViewAttribute() {
        return Auth::check() && Auth::user()->can('view', $this);
    }
    public function getIdentityForced() {
        return $this->load('identity')->makeVisible('identity')->identity;
    }
}
