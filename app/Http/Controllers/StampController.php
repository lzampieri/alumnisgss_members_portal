<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\Identity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StampController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->hasPermissionTo('clockin')) {
            return redirect()->route('clockings.employee');
        }
        if (Auth::user()->hasPermissionTo('clockin-view-all')) {
            return redirect()->route('clockings.monthly');
        }
        return ErrorsController::e403($request);
    }

    public function employee()
    {
        // TODO add authorization

        $clockedIn = Auth::user()->identity->stamps()
            ->whereDate('date', Carbon::now())
            ->whereNull('clockout')->select(['clockin'])->latest()->first();

        $data = [
            'clockedIn' => $clockedIn,
            'user' => Auth::user()
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

    public function monthly($year = -1, $month = -1)
    {
        if ($year == -1 || $month == -1) {
            $today = Carbon::now();
            $year = $today->year;
            $month = $today->month;
        }

        $stampsFilter = function ($query) use ($year, $month) {
            $query->whereYear('date', $year)->whereMonth('date', $month);
        };
        $stampsFilter = function ($query) use ($year, $month) {
            $query->whereYear('date', $year)->whereMonth('date', $month);
        };

        if (Auth::user()->hasPermissionTo('clockin-view-all')) {
            $data = array_merge(
                Alumnus::whereHas('stamps', $stampsFilter)->with(['stamps' => $stampsFilter])->get()->all(),
                External::whereHas('stamps', $stampsFilter)->with(['stamps' => $stampsFilter])->get()->all()
            );
        } else {
            // $data = [];
            $data = [Auth::user()->identity->load('stamps')];
        }

        array_walk($data, function (&$ident, $key) {
            $ident->stamps_grouped = $ident->stamps->groupBy(function ($item, $key) {
                return $item->date->day;
            });
        });

        return response()->json($data);
    }
}
