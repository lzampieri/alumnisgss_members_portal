<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StampController extends Controller
{
    public function index()
    {
        // TODO should redirect to the proper page based if the guy is employee or worker
        return redirect()->route('clockings.employee');
    }

    public function employee()
    {
        // TODO add authorization

        $clockedIn = Auth::user()->identity->stamps()
            ->whereDate('date', Carbon::now())
            ->whereNull('clockout')->select(['clockin'])->latest()->first();

        $data = [
            'clockedIn' => $clockedIn
        ];

        return Inertia::render('Clockings/Employee', $data);
    }

    public function clockin()
    {
        // TODO add authorization
        // Check if the user is not already clocked in
        $clockedIn = Auth::user()->identity->stamps()
            ->whereDate('date', Carbon::now())
            ->whereNull('clockout')->count() > 0;

        if ($clockedIn) {
            return redirect()->back()->with(['notistack' => ['error', 'Risulti già entrato']]);
        }

        Auth::user()->identity->stamps()->create([
            'date' => Carbon::now(),
            'clockin' => Carbon::now(),
            'ip' => request()->ip()
        ]);

        return redirect()->back()->with(['notistack' => ['success', 'Buona giornata!']]);
    }

    public function clockout()
    {
        // TODO add authorization

        $clockedIn = Auth::user()->identity->stamps()
            ->whereDate('date', Carbon::now())
            ->whereNull('clockout')->latest()->first();

        if (!$clockedIn) {
            return redirect()->back()->with(['notistack' => ['error', 'Non risulti entrato']]);
        }

        $clockedIn->clockout = Carbon::now();
        $clockedIn->save();

        return redirect()->back()->with(['notistack' => ['success', 'A presto!']]);
    }
}
