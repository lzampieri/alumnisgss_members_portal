<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ADetail extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    protected $fillable = [
        'value',
        'a_details_type_id',
        'identity_type',
        'identity_id'
    ];
    protected $casts = [
        'value' => 'array'
    ];

    public function identity()
    {
        return $this->morphTo();
    }

    public function aDetailsType()
    {
        return $this->belongsTo(ADetailsType::class);
    }
}
