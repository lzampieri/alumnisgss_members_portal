<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $fillable = [
        'handle',
        'parent_type',
        'parent_id'
    ];

    
    public function parent()
    {
        return $this->morphTo();
    }
}
