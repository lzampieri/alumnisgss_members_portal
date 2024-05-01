<?php

namespace App\Models;

use App\Http\Controllers
use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdentityDetail extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    // All used details
    public static function allDetails()
    {
        $all_keys = IdentityDetail::select(['key', 'value'])->distinct()->get()
            ->groupBy('key')->map(function ($subarr) {
                return $subarr->pluck('value');
            })
            ->toArray();
        return $all_keys;
    }

    protected $fillable = [
        'key',
        'value'
    ];

    public function identity()
    {
        return $this->morphTo();
    }
}
