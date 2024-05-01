<?php
namespace App\Traits;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use Illuminate\Database\Eloquent\Model;

trait SoftEditsAreLogged {
    public static function bootSoftEditsAreLogged() {
        static::restored( function (Model $item) {
            LogController::log( LogEvents::RESTORED, $item );
        });
    }
}
