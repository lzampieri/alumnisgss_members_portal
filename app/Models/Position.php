<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use EditsAreLogged;
    
    protected $fillable = [
        'type',
        'note',
        'from',
        'to'
    ];
    protected $casts = [
        'from' => 'date',
        'to' => 'date',
    ];

    public function owner()
    {
        return $this->morphTo();
    }
}
