<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permalink extends Model
{
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
}
