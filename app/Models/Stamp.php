<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stamp extends Model
{
    use EditsAreLogged;
    use SoftDeletes, SoftEditsAreLogged;

    protected $fillable = [
        'ip',
        'date',
        'type',
        'clockin',
        'clockout',
        'note',
    ];

    protected $casts = [
        'date' => 'date',
        'type' => StampTypes::class
    ];

    protected $hidden = ['ip'];

    public function employee()
    {
        return $this->morphTo();
    }

    protected $appends = ['hours'];
    public function getHoursAttribute(): float
    {
        if (is_null($this->clockin) || is_null($this->clockout)) return 0;
        $diff = $this->clockout->floatDiffInHours($this->clockin);
        // Approx to 15 minutes
        $diff = ((float) round($diff * 4)) / 4;
        return $diff;
    }

    // Casting function for times
    public function getClockinAttribute(?string $value): ?Carbon
    {
        if (is_null($value)) return null;
        return Carbon::createFromFormat('H:i:s', $value);
    }
    public function setClockinAttribute(?Carbon $value)
    {
        if (is_null($value)) $this->attributes['clockin'] = null;
        else $this->attributes['clockin'] = $value->format('H:i:s');
    }
    public function getClockoutAttribute(?string $value): ?Carbon
    {
        if (is_null($value)) return null;
        return Carbon::createFromFormat('H:i:s', $value);
    }
    public function setClockoutAttribute(?Carbon $value)
    {
        if (is_null($value)) $this->attributes['clockout'] = null;
        else $this->attributes['clockout'] = $value->format('H:i:s');
    }
}
