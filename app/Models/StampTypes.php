<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes;


class StampTypes implements CastsAttributes, SerializesCastableAttributes
{
    private static $types = NULL;

    private function popTypes() {
        StampTypes::$types = [
            'work' => new StampType('work', 'Lavoro', 'L',true,'#b6e3e7'),
            'ferie' => new StampType('ferie', 'Ferie', 'F',false,'#fab394'),
            'ill' => new StampType('ill', 'Malattia', 'M',false,'#feaeca', function (Carbon $date) { return $date->isBefore(Carbon::now()->addDay()); } ),
            'default' => new StampType('default', 'Errore', 'E',false,'#d1d1d1')
        ];
    }

    public function get($model, string $key, $value, array $attributes)
    {
        if( is_null( StampTypes::$types ) ) $this->popTypes();
        if( in_array( $value, array_keys(StampTypes::$types) ) ) return StampTypes::$types[ $value ];
        return StampTypes::$types['default'];
    }
    public static function getFromKey($value)
    {
        return (new StampTypes())->get(null, '', $value, []);
    }
    public static function getAllTypes(){
        if( is_null( StampTypes::$types ) ) (new StampTypes())->popTypes();
        return StampTypes::$types;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        if( is_null( StampTypes::$types ) ) $this->popTypes();
        if( $value instanceof StampType ) return $value->tag;
        return $value;
    }

    public function serialize($model, string $key, $value, array $attributes)
    {
        return $value->serialize();
    }    
}