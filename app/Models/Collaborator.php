<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;

class Collaborator extends Model
{
    use EditsAreLogged;
    
    protected $fillable = [
        'id',
        'IBAN',
        'holder',
        'bank'
    ];

    public function person()
    {
        return $this->belongsTo(Person::class, 'id');
    }
}
