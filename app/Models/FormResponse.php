<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormResponse extends Model
{
    protected $fillable = [
        'data'
    ];

    public function resource()
    {
        return $this->belongsTo(Resource::class);
    }

    public function sender()
    {
        return $this->belongsTo(Person::class);
    }
}
