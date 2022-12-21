<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log as OriginalLog;
use Rap2hpoutre\LaravelLogViewer\LogViewerController;

class Log extends Controller
{

    public function index() {
        // $this->authorize( 'log-view' );

        return (new LogViewerController)->index();
    }

    public static function debug(string $message) {
        OriginalLog::channel('internal')->debug( $message );
    }

}
