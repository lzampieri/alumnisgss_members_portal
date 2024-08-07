<?php
namespace App\Traits;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogControllerFile;
use App\Http\Controllers\LogEvents;
use Illuminate\Database\Eloquent\Model;

trait EditsAreLogged {
    public static function bootEditsAreLogged() {

        static::created( function (Model $item) {
            LogController::log( LogEvents::CREATE, $item );
        });
        
        static::updating( function (Model $item) {
            $original = $item->getOriginal();

            foreach( $original as $field => $oldValue ) {
                if( $item[$field] != $oldValue )
                    LogController::log( LogEvents::UPDATE, $item, $field, $oldValue, $item[$field] );
            }
        });

        static::deleting( function (Model $item) {
            LogController::log( LogEvents::DELETE, $item );
        });
    }
}
