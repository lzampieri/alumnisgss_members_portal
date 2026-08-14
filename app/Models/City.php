<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'lat','lng'
    ];
    
    public function logify()
    {
        return $this->name . " shown as " . $this->display_name;
    }
}
