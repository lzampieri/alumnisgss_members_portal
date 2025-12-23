<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Log;
use App\Http\Controllers\LogController;
use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthLev2
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string|null  ...$guards
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if( !Auth::check() || !Auth::user()->lev2_loggedin() ) {
            $request->session()->put('url.intended', url()->full());
            return Inertia::location(route('auth.login_lv2.google'));
        }

        return $next($request);
    }
}
