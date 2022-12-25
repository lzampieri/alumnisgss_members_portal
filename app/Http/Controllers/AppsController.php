<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
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

        if (Auth::user() && Auth::user()->can('viewAny', Alumnus::class)) {
            $apps[] = 'registry';
        }

        if (Auth::user() && Auth::user()->hasPermissionTo('log-manage')) {
            $apps[] = 'logs';
        }

        if (Auth::user() && Auth::user()->can('viewAny', User::class)) {
            $apps[] = 'accesses';
        }

        return Inertia::render('Home', ['apps' => $apps]);
    }
}
