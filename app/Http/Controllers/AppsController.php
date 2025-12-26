<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\Newsletters;
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
            $apps[] = 'map';
        }

        if (Auth::user() && Auth::user()->can('viewAny', Alumnus::class)) {
            $apps[] = 'registry';
        }

        if (Auth::user() && Auth::user()->can('viewHimself', Alumnus::class) ) {
            $apps[] = 'profile';
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

        if (Auth::user() && Auth::user()->can('viewAny', Email::class)) {
            $apps[] = 'accesses';
        }

        if (Auth::user() && Auth::user()->hasPermissionTo('permissions-view')) {
            $apps[] = 'permissions';
        }

        if (Auth::user() && (Auth::user()->can('clockin', Stamp::class) || Auth::user()->can('viewAny', Stamp::class))) {
            $apps[] = 'clockings';
        }
        
        if (Auth::user()) {
            $apps[] = 'helpdesk';
        }

        if (Auth::user()  && Auth::user()->can('sync', Email::class) ) {
            $apps[] = 'contacts';
        }

        if (Auth::user()  && (
            Auth::user()->can('create', Newsletter::class) ||
            Auth::user()->identity->newsletters()->count() > 0
        )) {
            $apps[] = 'newsletters';
        }

        return Inertia::render('Home', ['apps' => $apps]);
    }
}
