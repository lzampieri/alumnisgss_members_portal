<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as OriginalLog;
use Rap2hpoutre\LaravelLogViewer\LogViewerController;
use Spatie\Permission\Models\Permission;

class Log extends Controller
{

    public function index()
    {
        $this->authorize('log-manage');
        
        return (new LogViewerController)->index();
    }

    public static function stringify( $object ) {
        if( is_array( $object ) ) {
            $output = "[ ";
            foreach( $object as $key => $value ) {
                if( is_numeric( $key ) )
                    $output .= Log::stringify( $value ) . " | ";
                else
                    $output .= $key . " => " . Log::stringify( $value ) . " | ";
            }
            return rtrim( rtrim( $output, " "), "|" ) . "]";
        }
        if( $object instanceof Alumnus )
            return "(" . $object->id . ") " . $object->surname . " "  . $object->name . " [" . Alumnus::names[ $object->status ] . "]";
        if( $object instanceof User )
            return $object->email;
        if( $object instanceof Permission )
            return $object->name;
        return $object;
    }

    public static function debug(string $message, $params)
    {
        $message .= " " . Log::stringify( $params );
        if( Auth::check() )
            $message = "(" . Auth::user()->email . ") " . $message;
        OriginalLog::channel('internal')->debug($message);
    }
}
