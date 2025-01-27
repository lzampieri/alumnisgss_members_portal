<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ArrayableDetailsType extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    // Get All with default order
    public static function allOrdered()
    {
        return ArrayableDetailsType::orderBy('order')->get();
    }
    // Get All visible with default order
    public static function visibleOrdered()
    {
        return ArrayableDetailsType::where('visible', true)->orderBy('order')->get();
    }

    protected $fillable = [
        'name',
        'separators',
        'order',
        'visible'
    ];

    public function arrayableDetails()
    {
        return $this->hasMany(ArrayableDetail::class);
    }
}
