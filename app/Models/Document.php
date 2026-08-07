<?php

namespace App\Models;

use App\Http\Controllers\LogEvents;
use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Document extends Model
{
    use EditsAreLogged;
    
    protected $fillable = [
        'protocol',
        'identifier',
        'date',
        'note',
        'author_type',
        'author_id',
        'attached_to_id'
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public function author()
    {
        return $this->morphTo();
    }

    public function ratifications()
    {
        return $this->hasMany(Ratification::class);
    }

    public function files()
    {
        return $this->morphMany(File::class, 'parent');
    }

    public function dynamicPermissions()
    {
        return $this->morphMany(DynamicPermission::class, 'permissable');
    }

    public function attached_to()
    {
        return $this->belongsTo(Document::class, 'attached_to_id');
    }

    public function attachments()
    {
        return $this->hasMany(Document::class, 'attached_to_id');
    }

    protected $appends = ['canView','canEdit'];
    public function getCanViewAttribute()
    {
        if ($this->attached_to_id) return $this->attached_to->canView;
        return DynamicPermission::UserCanViewPermissable($this);
    }
    public function getCanEditAttribute()
    {
        return Auth::check() && Auth::user()->can('edit', $this);
    }
}
