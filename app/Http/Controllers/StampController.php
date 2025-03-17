<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\StampTypes;
use Carbon\Carbon;
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
            ->whereNull('clockout')->select(['clockin', 'type'])->latest()->first();
        $canClockToday = true;

        if ($clockedIn && !$clockedIn->type->clockable) $canClockToday = false;

        $data = [
            'clockedIn' => $clockedIn,
            'canClockToday' => $canClockToday,
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
            ->whereNull('clockout')->latest()->first();

        if ($clockedIn && $clockedIn->type->clockable) {
            return redirect()->back()->with(['notistack' => ['error', 'Risulti già entrato']]);
        }
        if ($clockedIn) {
            return redirect()->back()->with(['notistack' => ['error', 'Non è permesso timbrare in un giorno di ' + $clockedIn->type->label]]);
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
        if (!$clockedIn->type->clockable) {
            return redirect()->back()->with(['notistack' => ['error', 'Non è permesso timbrare in un giorno di ' + $clockedIn->type->label]]);
        }

        $clockedIn->clockout = Carbon::now();
        $clockedIn->save();

        return redirect()->back()->with(['notistack' => ['success', 'A presto!']]);
    }

    public function manageSpecials()
    {
        // TODO add authorization

        $from = Carbon::now()->subMonth()->startOfMonth();
        $to = Carbon::now()->addMonth()->endOfMonth();

        $data = Auth::user()->identity->stamps()
            ->whereBetween('date', [$from, $to])
            ->whereNull('clockin')->get()->groupBy(function ($item, $key) {
                return $item->date->year . '-' . str_pad( $item->date->month, 2, "0", STR_PAD_LEFT ). '-' . str_pad( $item->date->day, 2, "0", STR_PAD_LEFT );
            });
        $busyDays = Auth::user()->identity->stamps()
            ->whereBetween('date', [$from, $to])
            ->whereNotNull('clockin')
            ->select(['date'])->get()->map(function ($item, $key) {
                return $item->date->year . '-' . str_pad( $item->date->month, 2, "0", STR_PAD_LEFT ). '-' . str_pad( $item->date->day, 2, "0", STR_PAD_LEFT );
            });

        return Inertia::render('Clockings/ManageSpecials', [
            'from' => $from,
            'to' => $to,
            'specials' => $data,
            'busyDays' => $busyDays,
            'allTypes' => array_values( StampTypes::getAllTypes() )
        ]);
    }

    public function monthly(int $year = -1, int $month = -1)
    {
        if ($year == -1 || $month == -1) {
            $today = Carbon::now();
            $year = $today->year;
            $month = $today->month;
        }

        $stampsFilter = function ($query) use ($year, $month) {
            $query->whereYear('date', $year)->whereMonth('date', $month);
        };

        if (Auth::user()->hasPermissionTo('clockin-view-all')) {
            $data = array_merge(
                Alumnus::whereHas('stamps', $stampsFilter)->with(['stamps' => $stampsFilter])->get()->all(),
                External::whereHas('stamps', $stampsFilter)->with(['stamps' => $stampsFilter])->get()->all()
            );
        } else {
            $data = [Auth::user()->identity->load(['stamps' => $stampsFilter])];
        }

        array_walk($data, function (&$ident, $key) {
            $ident->stamps_grouped = $ident->stamps->groupBy(function ($item, $key) {
                return $item->date->day;
            });
            array_walk($ident->stamps_grouped, function (&$day, $key) {
                $day = $day->groupBy(function ($item, $key) {
                    return $item->type;
                });
            });
        });

        return Inertia::render('Clockings/Monthly', [
            'data' => $data,
            'year' => $year,
            'month' => $month
        ]);
    }
}
