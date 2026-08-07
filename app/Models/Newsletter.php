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

    private static function zin($item) {
        // Return length or zero if null
        return $item ? count($item) : 0;
    }

    public function getCountToAttribute()
    {
        return array_reduce( $this->mailingLists->all(), function($carry, $ml) { return $carry + $ml->count;}, 0 ) + $this->zin($this->to);
    }

    public function getTotalCountToAttribute()
    {
        $cc = $this->getCountToAttribute();
        if( $this->has('childrens') ) {
            $cc += array_reduce( $this->childrens->append('countTo')->pluck('countTo')->toArray(), function ($c,$i) { return $c+$i; }, 0 );
        }
        return $cc;
    }

    public function getSentToAttribute()
    {
        if( $this->sent_at ) {
            return $this->getCountToAttribute();
        }
        return 0;
    }

    public function getTotalSentToAttribute()
    {
        $cc = $this->getSentToAttribute();
        if( $this->has('childrens') ) {
            $cc += array_reduce( $this->childrens->append('sentTo')->pluck('sentTo')->toArray(), function ($c,$i) { return $c+$i; }, 0 );
        }
        return $cc;
    }

    public function getScheduledAttribute()
    {
        if( (!$this->sent_at) && ($this->from == 'SMTP') ) {
            return $this->getCountToAttribute();
        }
        return 0;
    }

    public function getTotalScheduledAttribute()
    {
        $cc = $this->getScheduledAttribute();
        if( $this->has('childrens') ) {
            $cc += array_reduce( $this->childrens->append('scheduled')->pluck('scheduled')->toArray(), function ($c,$i) { return $c+$i; }, 0 );
        }
        return $cc;
    }

    public function attch_mine()
    {
        return $this->morphMany(File::class, 'parent');
    }

    public function mailingLists()
    {
        return $this->belongsToMany(MailingList::class);
    }

    public function getAllToAttribute()
    {
        return array_merge($this->to, $this->mailingLists->pluck('to')->toArray());
    }
}
