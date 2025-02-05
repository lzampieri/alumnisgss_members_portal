<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ADetailsType extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    // Get All with default order
    public static function allOrdered()
    {
        return ADetailsType::orderBy('order')->get();
    }
    // Get All visible with default order
    public static function visibleOrdered()
    {
        return ADetailsType::where('visible', true)->orderBy('order')->get();
    }

    protected $fillable = [
        'name',
        'type',
        'param',
        'order',
        'visible'
    ];

    public function aDetails()
    {
        return $this->hasMany(ADetail::class);
    }
}
