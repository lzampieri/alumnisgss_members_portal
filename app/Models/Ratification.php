<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;

class Ratification extends Model
{
    use EditsAreLogged;
    
    protected $fillable = [
        'required_state',
        'alumnus_id',
        'document_id',
        'state_at_document_emission' // SHOULD BE FILLED WHEN DOCUMENT_ID IS FILLED
    ];

    public function alumnus()
    {
        return $this->belongsTo(Alumnus::class);
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
