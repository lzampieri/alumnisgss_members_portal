<?php
namespace App\Models;

use App\Traits\EditsAreLogged;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission {
    use EditsAreLogged;
}