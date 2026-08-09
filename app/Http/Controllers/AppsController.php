<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Models\Newsletter;
use App\Models\Person;
use App\Models\Ratification;
use App\Models\Stamp;
use App\Policies\PersonPolicy;
use App\Policies\PositionPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppsController extends Controller
{
    public function home()
    {
        $apps = [];

        if ((new PersonPolicy)->viewPublicStatus(Auth::user())) {
            $apps[] = 'members';
        }

        if (Auth::user() && Auth::user()->can('viewNetworkPage', Person::class)) {
            $apps[] = 'network';
            $apps[] = 'map';
        }

        if (Auth::user() && Auth::user()->can('viewAnyAlumnus', Person::class)) {
            $apps[] = 'registry';
        }

        if (Auth::user() && Auth::user()->can('viewHimself', Person::class)) {
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

        if (Auth::user() && Auth::user()->hasPermissionTo('groups-view')) {
            $apps[] = 'groups';
        }

        if (Auth::user() && (new PositionPolicy)->viewActive(Auth::user())) {
            $apps[] = 'positions';
        }

        if (Auth::user() && (Auth::user()->can('clockin', Stamp::class) || Auth::user()->can('viewAny', Stamp::class))) {
            $apps[] = 'clockings';
        }

        if (Auth::user()) {
            $apps[] = 'helpdesk';
        }

        if (Auth::user()  && Auth::user()->can('sync', Email::class)) {
            $apps[] = 'contacts';
        }

        if (Auth::user()  && (
            Auth::user()->can('create', Newsletter::class) ||
            Auth::user()->newsletters()->count() > 0
        )) {
            $apps[] = 'newsletters';
        }

        return Inertia::render('Home', ['apps' => $apps]);
    }

    public function maintenance(Request $request)
    {
        return Inertia::render('General/Maintenance');
    }
}
