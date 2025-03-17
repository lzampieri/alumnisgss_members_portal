<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes;
use Illuminate\Database\Eloquent\SoftDeletes;

class StampType
{
    public string $tag;
    public string $label;
    public string $acronym;
    public bool $clockable;
    public string $color;
    public function __construct(string $tag, string $label, string $acronym, bool $clockable, string $color)
    {
        $this->tag = $tag;
        $this->label = $label;
        $this->acronym = $acronym;
        $this->clockable = $clockable;
        $this->color = $color;
    }

    public function serialize() {
        return [
            'tag' => $this->tag,
            'label' => $this->label,
            'acronym' => $this->acronym,
            'clockable' => $this->clockable,
            'color' => $this->color
        ];
    }
}

class StampTypes implements CastsAttributes, SerializesCastableAttributes
{
    private static $types = NULL;

    private function popTypes() {
        StampTypes::$types = [
            'work' => new StampType('work', 'Lavoro', 'L',true,'#b6e3e7'),
            'ferie' => new StampType('ferie', 'Ferie', 'F',false,'#fab394'),
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
        return $value->tag;
    }

    public function serialize($model, string $key, $value, array $attributes)
    {
        return $value->serialize();
    }    
}

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
