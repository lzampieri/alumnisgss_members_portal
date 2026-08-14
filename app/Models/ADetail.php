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
        'identity_id'
    ];
    protected $casts = [
        'value' => 'array'
    ];

    public function identity()
    {
        return $this->belongsTo(Person::class,'identity_id');
    }

    public function aDetailsType()
    {
        return $this->belongsTo(ADetailsType::class);
    }

    public function logify()
    {
        return "Detail " . $this->value . " as " . $this->aDetailsType->logify() . " for " . $this->identity->logify();
    }
}
