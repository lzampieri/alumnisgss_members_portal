<?php

namespace App\Http\Controllers;


class ErrorsController extends Controller
{
    // Forbidden
    public static function e403()
    {
        // if (Auth::check())
        //     return redirect()->route('home');

        return response()->json(['Errore'=>403], 403);
    }
}
