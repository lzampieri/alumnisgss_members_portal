<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Carbon\Carbon;
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

    protected $appends = ['valid'];
    public function getValidAttribute()
    {
        return $this->from < Carbon::now() && $this->to > Carbon::now();
    }
    
    public function logify()
    {
        return "Position {$this->type} for {$this->owner->logify()}";
    }
}
