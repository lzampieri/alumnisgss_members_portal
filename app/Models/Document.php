<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{    
    use SoftDeletes;

    protected $fillable = [
        'identifier',
        'privacy',
        'date',
        'note',
        'handle',
        'author_id'
    ];


    protected $casts = [
        'date' => 'datetime',
    ];    

    public static $privacies = [
        'everyone',
        // 'members', Still to implement
        'cda',
        'secretariat'
    ];

    public function author() {
        return $this->belongsTo( User::class );
    }
}
