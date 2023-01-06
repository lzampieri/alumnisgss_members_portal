<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{    
    use SoftDeletes;

    protected $fillable = [
        'title',
        'identifier',
        'privacy',
        'handle',
        'author_id'
    ];

    public static $privacies = [
        'everyone',
        'members',
        'internal'
    ];

    public function author() {
        return $this->belongsTo( User::class );
    }
}
