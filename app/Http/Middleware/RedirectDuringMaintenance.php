<?php

namespace App\Http\Middleware;

use App\Http\Controllers\LogController;
use App\Utils\Settings;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectDuringMaintenance
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
        $routeUrl = $request->fullUrl();

        if( Settings::get('maintenance') ) {
            // // If an admin is stucked in the maintenance page, redirect them to the home page
            if( str_contains( $routeUrl, "maintenance" ) && Auth::check() && Auth::user()->hasPermissionTo('maintenance-access') )
                return redirect(null, 307)->route('home');

            // Allow access to the maintenance page
            if( str_contains( $routeUrl, "maintenance" ) )
                return $next($request);

            // Continue if the user has permission to access the website in maintenance mode
            if( Auth::check() && Auth::user()->hasPermissionTo('maintenance-access') )
                return $next($request);

            // Continue if the user is trying to login or logout
            if( str_contains( $routeUrl, "login" ) || str_contains( $routeUrl, "logout" ) || str_contains( $routeUrl, "google/callback" ) )
                return $next($request);

            // Allow access to the permission verify page
            if( str_contains( $routeUrl, "permissions/verify" ) )
                return $next($request);

        //     // Redirect to the maintenance page
            return redirect(null, 307)->route('maintenance');
        }

        return $next($request);
    }
}
