<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    protected $fillable = [
        'type',
        'content',
        'order',
        'blockable_type',
        'blockable_id'
    ];

    
    public function blockable()
    {
        return $this->morphTo();
    }
}
