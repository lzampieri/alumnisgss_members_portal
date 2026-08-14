<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketComment extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    
    protected $fillable = [
        'content',
    ];

    public function author()
    {
        return $this->morphTo('author');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    
    public function logify()
    {
        return "Comment #{$this->id} of {$this->author->logify()} on {$this->ticket->logify()}";
    }
}
