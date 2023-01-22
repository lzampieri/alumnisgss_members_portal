<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{    
    protected $fillable = [
        'identifier',
        'privacy',
        'date',
        'note',
        'handle',
        'author_type',
        'author_id'
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public static $privacies = [
        'everyone',
        'members',
        'cda',
        'secretariat'
    ];

    public function author() {
        return $this->morphTo();
    }

    public function ratifications() {
        return $this->hasMany( Ratification::class );
    }
}
