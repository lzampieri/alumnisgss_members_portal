<?php

namespace App\Models;

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