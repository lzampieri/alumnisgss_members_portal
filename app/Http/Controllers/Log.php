<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log as OriginalLog;
use Rap2hpoutre\LaravelLogViewer\LogViewerController;

class Log extends Controller
{

    public function index()
    {
        $this->authorize('log-manage');

        return (new LogViewerController)->index();
    }

    public static function debug(string $message, array $params)
    {
        foreach( $params as $key => $value ) {
            $message .= " | " . $key . " => " . $value;
        }
        OriginalLog::channel('internal')->debug($message);
    }
}
