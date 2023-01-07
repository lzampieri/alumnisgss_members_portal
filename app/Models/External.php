<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class External extends Identity
{
    protected $fillable = [
        'name',
        'surname',
        'notes'
    ];
}
