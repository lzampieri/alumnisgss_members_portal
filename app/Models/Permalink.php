<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;

class Permalink extends Model
{
    use EditsAreLogged;
    
    protected $fillable = [
        'id'
    ];
    public $timestamps = false;

    public $incrementing = false;
    protected $keyType = 'string';

    public function linkable()
    {
        return $this->morphTo();
    }

    public function logify()
    {
        return "Permalink " . $this->id . " to " . $this->linkable_type . " #" . $this->linkable_id;
    }
}
