<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use Illuminate\Support\Facades\Log as OriginalLog;
use Rap2hpoutre\LaravelLogViewer\LogViewerController;

class Log extends Controller
{

    public function index()
    {
        $this->authorize('log-manage');

        return (new LogViewerController)->index();
    }

    public static function stringify( $object ) {
        if( $object instanceof Alumnus )
            return "(" . $object->id . ") " . $object->surname . " "  . $object->name . " [" . Alumnus::names[ $object->status ] . "]";
        return $object;
    }

    public static function debug(string $message, $params)
    {
        foreach( $params as $key => $value ) {
            $message .= " | " . $key . " => " . Log::stringify( $value );
        }
        OriginalLog::channel('internal')->debug($message);
    }
}
