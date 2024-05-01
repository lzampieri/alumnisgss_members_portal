<?php

namespace App\Http\Controllers;

use Rap2hpoutre\LaravelLogViewer\LogViewerController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as FileLog;


class LogControllerFile extends Controller
{
    
    public function index()
    {
        $this->authorize('logfile-view');

        return (new LogViewerController)->index(); // TODO sostituire con qualcosa di homemade
    }

    public static function debug(string $message, $params = [])
    {
        $message .= " " . LogController::stringify($params);
        if (Auth::check())
            $message = "(" . Auth::user()->credential . ") " . $message;
            FileLog::channel('internal')->debug($message);
    }

    public static function error(string $message, $params = [])
    {
        $message .= " " . LogController::stringify($params);
        if (Auth::check())
            $message = "(" . Auth::user()->credential . ") " . $message;
            FileLog::channel('internal')->error($message);
    }
}
