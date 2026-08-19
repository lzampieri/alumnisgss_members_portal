<?php

namespace App\Models;

use App\Policies\ProjectPolicy;
use App\Traits\EditsAreLogged;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Project extends Model
{
    use EditsAreLogged;
    
    protected $fillable = [
        'title',
        'from',
        'to',
        'open'
    ];
    protected $casts = [
        'from' => 'date',
        'to' => 'date',
    ];

    public function permissions()
    {
        return $this->morphMany(DynamicPermission::class,'permissable');
    }
    protected function canView(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  (new ProjectPolicy)->view(Auth::user(), $this));
    }
    protected function canSee(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  Auth::check() && Auth::user()->can('see', $this));
    }
    protected function canApprove(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  Auth::check() && Auth::user()->can('approve', $this));
    }
    protected function canEdit(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  Auth::check() && Auth::user()->can('edit', $this));
    }
    public function running(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  $this->from < Carbon::now() && $this->to > Carbon::now());
    }

    public function logify()
    {
        return "Project {$this->title} from {$this->from} to {$this->to} (open: {$this->open})";
    }
}
