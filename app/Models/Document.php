<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{    
    protected $fillable = [
        'protocol',
        'identifier',
        'date',
        'note',
        'author_type',
        'author_id'
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public static $privacies = [
        'everyone',
        'members',
        'cda',
        'secretariat'
    ];

    public function author() {
        return $this->morphTo();
    }

    public function ratifications() {
        return $this->hasMany( Ratification::class );
    }    
    
    public function files() {
        return $this->morphMany( File::class, 'parent' );
    }
    
    public function dynamicPermissions() {
        return $this->morphMany( DynamicPermission::class, 'permissable' );
    }
    
    protected $appends = ['canView'];
    public function getCanViewAttribute() {
        return DynamicPermission::UserCanViewPermissable($this);
    }
}
