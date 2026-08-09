<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ErrorsController extends Controller
{
    // Forbidden
    public static function e403(Request $request)
    {
        if( $request->hasSession() && !Auth::check() ) {
            $request->session()->put('url.intended', url()->full());
            return redirect()->route('login');
        }

        if ($request->inertia())
            return redirect(null, 403)->back()->with('errorsDialogs', ["Non hai il permesso di accedere a questa risorsa."]);

        return redirect()->route('home')->with('errorsDialogs', ["Non hai il permesso di accedere a questa risorsa."]);
    }

    // Wrong pathway
    public static function e422(Request $request)
    {
        if ($request->inertia())
            return redirect(null, 422)->back()->with('errorsDialogs', ["Non è possibile effettuare questa operazione in questo modo."]);

        return redirect()->route('home')->with('errorsDialogs', ["Non è possibile effettuare questa operazione in questo modo."]);
    }

    // Unimplemented
    public static function e501(Request $request)
    {
        if ($request->inertia())
            return redirect(null, 501)->back()->with('errorsDialogs', ["Questa operazione non esiste in questo portale."]);

        return redirect()->route('home')->with('errorsDialogs', ["Questa operazione non esiste in questo portale."]);
    }
}
