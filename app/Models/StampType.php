<?php

namespace App\Models;

use Closure;

class StampType
{
    public string $tag;
    public string $label;
    public string $acronym;
    public bool $clockable;
    public string $color;
    public Closure $checkDates;

    public function __construct(string $tag, string $label, string $acronym, bool $clockable, string $color, Closure $checkDates = null )
    {
        $this->tag = $tag;
        $this->label = $label;
        $this->acronym = $acronym;
        $this->clockable = $clockable;
        $this->color = $color;
        if( $checkDates !== null ) $this->checkDates = $checkDates;
        else $this->checkDates = function ($date) { return true; };
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