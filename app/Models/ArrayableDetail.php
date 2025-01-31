<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ArrayableDetail extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    protected $fillable = [
        'value',
        'arrayable_details_type_id'
    ];
    protected $casts = [
        'value' => 'array'
    ];

    public function identity()
    {
        return $this->morphTo();
    }

    public function arrayableDetailsType()
    {
        return $this->belongsTo(ArrayableDetailsType::class);
    }
}
