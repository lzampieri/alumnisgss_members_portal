<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResourcesSection extends Model
{
    protected $primaryKey = 'name';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

}
