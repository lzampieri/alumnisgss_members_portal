<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Reimbursement extends Model
{
    use EditsAreLogged;
    use SoftDeletes;
    
    protected $fillable = [
        'project_id',
        'motivation',
        'notes',
        'content',
        'internal_notes',
        'total',
        'author_id',
        'sent',
        'approver_id',
        'approved',
        'payer_id',
        'paid',
    ];

    protected $casts = [
        'sent' => 'datetime',
        'approved' => 'datetime',
        'paid' => 'datetime',
        'content' => 'array'
    ];

    
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
    public function author()
    {
        return $this->belongsTo(Person::class);
    }
    public function approver()
    {
        return $this->belongsTo(Person::class);
    }
    public function payer()
    {
        return $this->belongsTo(Person::class);
    }

    protected $appends = ['iden', 'state'];
    protected function iden(): Attribute {
        return Attribute::make( get: fn () => $this->author ? $this->author->surname . $this->id : 'Sconosciuto' . $this->id );
    }
    protected function state(): Attribute {
        return Attribute::make( get: function () {
            if( !$this->sent ) return 'draft';
            if( !$this->approved ) return 'sent';
            if( !$this->paid ) return 'approved';
            return 'paid';
        } );
    }
    
    protected function canView(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) => Auth::check() && Auth::user()->can('view', $this));
    }
    protected function canEdit(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) => Auth::check() && Auth::user()->can('edit', $this));
    }
    protected function canApprove(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) => Auth::check() && $this->project && $this->project->can_approve);
    }
}
