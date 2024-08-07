<?php

namespace App\Models;

use App\Traits\EditsAreLogged;

class External extends Identity
{
    use EditsAreLogged;

    protected $fillable = [
        'name',
        'surname',
        'notes'
    ];
}
