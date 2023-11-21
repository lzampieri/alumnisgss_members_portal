<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AwsSession extends Model
{
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

    
    protected $appends = ['duration','day'];
    public function getDurationAttribute() {
        if( $this->starttime && $this->endtime ) {
            return $this->endtime->diffInMinutes($this->starttime);
        }
        return 0;
    }
    public function getDayAttribute() {
        if( $this->starttime )
            return $this->starttime->format( 'Y-m-d' );
        if( $this->endtime )
            return $this->endtime->format( 'Y-m-d' );
        return '0';
    }
}
