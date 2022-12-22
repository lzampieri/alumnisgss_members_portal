<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alumnus extends Model
{
    protected $fillable = [
        'name',
        'surname',
        'coorte'
    ];
}
