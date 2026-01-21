<?php

namespace App\Models;

use App\Policies\ExternalPolicy;
use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Auth;

class External extends Identity
{
    use EditsAreLogged;

    protected $fillable = [
        'name',
        'surname',
        'notes'
    ];

    protected $visible = [
        'id',
        'surname',
        'name',
        'notes'
    ];
    
    protected function canView(): Attribute {
        return Attribute::make( get: fn (mixed $_, array $attributes) => Auth::check() && (new ExternalPolicy)->view(Auth::user()) );
    }
}
