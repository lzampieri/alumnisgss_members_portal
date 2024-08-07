<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    protected $fillable = [
        'title',
        'content'
    ];
    
    public function dynamicPermissions() {
        return $this->morphMany( DynamicPermission::class, 'permissable' );
    }
    
    public function files() {
        return $this->morphMany( File::class, 'parent' );
    }
    
    public function getCanViewAttribute() {
        return DynamicPermission::UserCanViewPermissable($this) || DynamicPermission::UserCanEditPermissable($this);
    }
    public function getCanEditAttribute() {
        return DynamicPermission::UserCanEditPermissable($this);
    }

    public function permalinks() {
        return $this->morphMany( Permalink::class, 'linkable' );
    }

}
