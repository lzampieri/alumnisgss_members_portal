<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull as Middleware;

class ConvertEmptyStringsToNull extends Middleware
{
    /**
     * The names of the attributes that should not be trimmed.
     *
     * @var array<int, string>
     */
    protected $except = [
        'current_password',
        'password',
        'password_confirmation',
        'separators'
    ];

    
    protected function transform($key, $value)
    {
        if( in_array( $key, $this->except ) ) return $value;
        return parent::transform($key, $value);
    }
}
