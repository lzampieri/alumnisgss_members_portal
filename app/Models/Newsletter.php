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
        'owner_id',
        'from',
        'parent_id'
    ];
    protected $casts = [
        'to' => 'array'
    ];

    public function owner()
    {
        return $this->morphTo('owner');
    }

    public function parent()
    {
        return $this->morphTo('parent_id');
    }

    public function attachments()
    {
        if( $this->parent_id )
            return $this->parent()->morphMany(File::class, 'parent');
        return $this->morphMany(File::class, 'parent');
    }

}
