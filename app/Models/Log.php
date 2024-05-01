<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use EditsAreLogged;

    protected $fillable = [
        'type',
        'field',
        'old_value',
        'new_value',
    ];
    
    public function agent()
    {
        return $this->morphTo();
    }
    public function item()
    {
        return $this->morphTo();
    }
}
