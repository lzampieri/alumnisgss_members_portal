<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title'
    ];
    
    public function blocks() {
        return $this->morphMany( Block::class, 'blockable' );
    }
    
    public function dynamicPermissions() {
        return $this->morphMany( DynamicPermission::class, 'permissable' );
    }
    
    public function getCanViewAttribute() {
        return DynamicPermission::UserCanViewPermissable($this);
    }
    public function getCanEditAttribute() {
        return DynamicPermission::UserCanEditPermissable($this);
    }
}
