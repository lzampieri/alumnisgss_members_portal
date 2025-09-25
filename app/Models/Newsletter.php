<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Newsletter extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    protected $fillable = [
        'to',
        'subject',
        'body',
        'sent_at',
        'owner_type',
        'owner_id'
    ];
    protected $casts = [
        'to' => 'array'
    ];

    public function owner()
    {
        return $this->morphTo('owner');
    }

}
