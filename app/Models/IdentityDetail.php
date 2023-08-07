<?php

namespace App\Models;

use App\Http\Controllers\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdentityDetail extends Model
{
    use SoftDeletes;

    // All used details
    public static function allDetailsNames() {
        $all_keys = IdentityDetail::select(['key'])->distinct()->get()->pluck('key')->toArray();
        return $all_keys;
    }
    
    protected $fillable = [
        'key',
        'value'
    ];

    public function identity() {
        return $this->morphTo();
    }

}
