<?php

namespace App\Models;

use App\Http\Controllers\LogEvents;
use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;

class AwsSession extends Model
{
    use EditsAreLogged;

    protected $fillable = [
        'aws_ref',
        'ip',
        'starttime',
        'endtime',
        'note'
    ];

    protected $casts = [
        'starttime' => 'datetime',
        'endtime' => 'datetime',
    ];


    protected $appends = ['duration', 'month', 'day'];
    public function getDurationAttribute()
    {
        if ($this->starttime && $this->endtime) {
            return $this->endtime->diffInMinutes($this->starttime);
        }
        return 0;
    }
    public function getMonthAttribute()
    {
        if ($this->starttime)
            return $this->starttime->year * 100 + $this->starttime->month;
        if ($this->endtime)
            return $this->endtime->year * 100 + $this->endtime->month;
        return 0;
    }
    public function getDayAttribute()
    {
        if ($this->starttime)
            return $this->month * 100 + $this->starttime->day;
        if ($this->endtime)
            return $this->month * 100 + $this->endtime->day;
        return '0';
    }
}
