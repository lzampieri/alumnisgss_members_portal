<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use function PHPUnit\Framework\isNull;

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
        return $this->belongsTo(Newsletter::class, 'parent_id');
    }

    public function childrens()
    {
        return $this->hasMany(Newsletter::class, 'parent_id');
    }

    public function getAttachmentsAttribute()
    {
        if( is_null( $this->parent_id ) )
            return $this->attch_mine;
        else
            return $this->parent->attch_mine;
    }

    public function attch_mine()
    {
        return $this->morphMany(File::class, 'parent');
    }

}
