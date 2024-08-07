<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class LogControllerDB extends Controller
{    
    public static function echo(string $event, Model $item, string $field, $oldValue, $newValue)
    {
        $newLog = Log::create([
            'type' => $event,
            'field' => $field,
            'old_value' => LogController::stringify( $oldValue ),        
            'new_value' => LogController::stringify( $newValue ),        
        ]);

        if( $item ) {
            $newLog->item()->associate( $item );
            $newLog->save();
        }

        if (Auth::check()) {
            $newLog->agent()->associate( Auth::user()->identity );
            $newLog->save();
        }
    }

}
