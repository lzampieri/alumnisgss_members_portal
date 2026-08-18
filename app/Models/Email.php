<?php

namespace App\Models;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use App\Traits\EditsAreLogged;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
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

    public function getCanDeleteAttribute() {
        return Auth::check() && Auth::user()->can('delete', $this);
    }
    public function getCanViewAttribute() {
        return Auth::check() && Auth::user()->can('view', $this);
    }
    public function getIdentityForced() {
        return $this->load('identity')->makeVisible('identity')->identity;
    }    
    
    public function logify()
    {
        return $this->address;
    }

    public function login() {
        Auth::login($this->identity);
        request()->session()->regenerate();
        request()->session()->put('auth.email', $this->id);
        LogController::log(LogEvents::LOGIN, $this);
        $this->token = null;
        $this->last_login = Carbon::now();
        $this->save();
    }
    public function login_lv2($token, $token_expdate, $approvedScopes) {
        Auth::login($this->identity);
        request()->session()->regenerate();
        request()->session()->put('auth.email', $this->id);
        LogController::log(LogEvents::LOGIN_LV2, $this, 'scopes', '', $approvedScopes);
        $this->token = $token;
        $this->token_expdate = $token_expdate;
        $this->last_login = Carbon::now();
        $this->save();
    }
    protected function lv2LoggedInThisaddress(): Attribute {
        return Attribute::make(get: function(mixed $_, array $attributes) {
            return $this->token && $this->token_expdate > now();
        });
    }
    public function logout() {
        $this->token = null;
        $this->token_expdate = Carbon::now();
        $this->save();
    }
}
