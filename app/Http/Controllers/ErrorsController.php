<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ErrorsController extends Controller
{
    // Forbidden
    public static function e403(Request $request)
    {
        if ($request->inertia())
            return redirect(null, 403)->back()->with('errorsDialogs', ["Non hai il permesso di accedere a questa risorsa."]);

        return redirect()->route('home')->with('errorsDialogs', ["Non hai il permesso di accedere a questa risorsa."]);
    }
}
