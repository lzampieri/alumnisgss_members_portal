<?php

namespace App\Models;

class Alumnus extends Identity
{
    // Available status
    const status = ['member','student_member','not_reached','student_not_reached','student_not_agreed','hasnt_right','dead','not_agreed'];

    protected $fillable = [
        'name',
        'surname',
        'coorte',
        'status'
    ];
}
