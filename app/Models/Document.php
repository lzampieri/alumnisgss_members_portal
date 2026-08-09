<?php

namespace App\Models;

use App\Http\Controllers\LogEvents;
use App\Policies\DocumentPolicy;
use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
        return $this->belongsTo(Person::class, 'author_id');
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

    protected $appends = ['can_view','can_edit'];
    protected function canView(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  (new DocumentPolicy)->view(Auth::user(), $this));
    }
    protected function canEdit(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  Auth::check() && Auth::user()->can('edit', $this));
    }
}
