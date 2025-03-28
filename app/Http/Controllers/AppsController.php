<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\LoginMethod;
use App\Models\Stamp;
use App\Policies\AlumnusPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppsController extends Controller
{
    public function home()
    {
        $apps = [];

        if ((new AlumnusPolicy)->viewMembers(Auth::user())) {
            $apps[] = 'members';
        }

        if (Auth::user() && Auth::user()->can('viewNetwork', Alumnus::class)) {
            $apps[] = 'network';
        }

        if (Auth::user() && Auth::user()->can('viewAny', Alumnus::class)) {
            $apps[] = 'registry';
        }

        if (Auth::user()) {
            $apps[] = 'reports';
        }
        
        // Anyone can access board
        $apps[] = 'board';

        if (Auth::user() && Auth::user()->can('view', Ratification::class)) {
            $apps[] = 'ratifications';
        }

        // Anyone can access resources
        $apps[] = 'resources';

        if (Auth::user() && Auth::user()->hasRole('webmaster')) {
            $apps[] = 'webmaster';
        }

        if (Auth::user() && Auth::user()->can('viewAny', LoginMethod::class)) {
            $apps[] = 'accesses';
        }

        if (Auth::user() && Auth::user()->hasPermissionTo('permissions-view')) {
            $apps[] = 'permissions';
        }

        if (Auth::user() && Auth::user()->can('clockin', Stamp::class) || Auth::user()->can('viewAny', Stamp::class)) { // Should check if is employee or manager
            $apps[] = 'clockings';
        }

        return Inertia::render('Home', ['apps' => $apps]);
    }
}
