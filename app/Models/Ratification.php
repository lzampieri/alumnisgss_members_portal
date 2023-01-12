<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ratification extends Model
{
    protected $fillable = [
        'required_state',
        'alumnus_id',
        'document_id'
    ];

    public function alumnus() {
        return $this->belongsTo( Alumnus::class );
    }

    public function document() {
        return $this->belongsTo( Document::class );
    }
}
