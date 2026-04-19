<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class MailingList extends Model
{
    use EditsAreLogged;

    
    protected $casts = [
        'list' => 'array'
    ];

    protected $fillable = [
        'name',
        'list'
    ];
    
    protected $appends = ['canView','canEdit'];
    public function getCanViewAttribute()
    {
        return Auth::check() && Auth::user()->can('view', $this);
    }
    public function getCanEditAttribute()
    {
        return Auth::check() && Auth::user()->can('edit', $this);
    }

    public function dynamicPermissions()
    {
        return $this->morphMany(DynamicPermission::class, 'permissable');
    }

    public function newsletters()
    {
        return $this->belongsToMany(Newsletter::class);
    }
}
