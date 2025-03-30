<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\Stamp;
use App\Models\StampTypes;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use mcaskill\array_group_by;

class StampController extends Controller
{

    public function clocker()
    {
        $data = ['user' => Auth::user()];

        if( Auth::user()->can('clockin', Stamp::class) ) {
            $data['canClockIn'] = true;
            
            $data['lastClockIn'] = Auth::user()->identity->stamps()
                ->whereDate('date', Carbon::now())
                ->whereNull('clockout')->select(['clockin', 'type'])->latest()->first();
            
            $data['canClockToday'] = !$data['lastClockIn'] || $data['lastClockIn']->type->clockable;
        }

        if( Auth::user()->can('viewOnline', Stamp::class) ) {
            $data['currentlyOnline'] = Stamp::whereDate('date', Carbon::now())
            ->whereNull('clockout')->with('employee')->get();
                // ->only(['employee','type']);
        }

        return Inertia::render('Clockings/Clocker', $data);
    }

    public function clockin()
    {
        $this->authorize('clockin', Stamp::class);

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
        $this->authorize('clockin', Stamp::class);

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
        $this->authorize('editMine', Stamp::class);

        $from = Carbon::now()->startOfMonth()->subMonth()->startOfMonth();
        $to = Carbon::now()->startOfMonth()->addMonth()->endOfMonth();

        $data = Auth::user()->identity->stamps()
            ->whereBetween('date', [$from, $to])
            ->whereNull('clockin')->get()->groupBy(function ($item, $key) {
                return $item->date->year . '-' . str_pad( $item->date->month, 2, "0", STR_PAD_LEFT ). '-' . str_pad( $item->date->day, 2, "0", STR_PAD_LEFT );
            });
        $workedDays = Auth::user()->identity->stamps()
            ->whereBetween('date', [$from, $to])
            ->whereNotNull('clockin')
            ->select(['date'])->get()->map(function ($item, $key) {
                return $item->date->year . '-' . str_pad( $item->date->month, 2, "0", STR_PAD_LEFT ). '-' . str_pad( $item->date->day, 2, "0", STR_PAD_LEFT );
            });

        return Inertia::render('Clockings/ManageSpecials', [
            'from' => $from,
            'to' => $to,
            'specials' => $data,
            'workedDays' => $workedDays,
            'allTypes' => array_values( StampTypes::getAllTypes() )
        ]);
    }

    public function addSpecials (Request $request) {
        $this->authorize('editMine', Stamp::class);

        $types = implode(',', array_filter( array_keys( StampTypes::getAllTypes() ), function ($item) { return ($item !== 'default') && ($item !== 'work'); } ) );

        $validated = $request->validate([
            'type' => 'required|in:' . $types,
            'days' => 'array'
        ]);

        $from = Carbon::now()->startOfMonth()->subMonth()->startOfMonth();
        $to = Carbon::now()->startOfMonth()->addMonth()->endOfMonth();

        $cont = 0;

        foreach ($validated['days'] as $day) {
            $date = Carbon::createFromFormat('Y-m-d', $day);
            if( $date->isBefore($from) || $date->isAfter($to) ) continue;

            $occupied = Auth::user()->identity->stamps()->whereDate('date', $date)->first();
            if ( $occupied ) continue;

            if( !StampTypes::getFromKey($validated['type']) ) continue;
            if( !StampTypes::getFromKey($validated['type'])->checkDates->call($this,$date) ) continue;

            Auth::user()->identity->stamps()->create([
                'date' => $date,
                'type' => $validated['type'],
                'ip' => request()->ip()
            ]);
            
            $cont += 1;
        }

        return redirect()->back()->with(['notistack' => ['success', $cont . ' eventi aggiunti']]);
    }

    public function delSpecial (Request $request) {
        
        $validated = $request->validate([
            'id' => 'required|numeric|exists:stamps,id'
        ]);
        
        $stamp = Stamp::find($validated['id']);

        $this->authorize('edit', $stamp);

        $types = array_filter( array_keys( StampTypes::getAllTypes() ), function ($item) { return ($item !== 'default') && ($item !== 'work'); } );

        if( !in_array( $stamp->type->tag, $types ) )
            return redirect()->back()->with(['notistack' => ['error', 'Evento non trovato' ]]);

        $from = Carbon::now()->startOfMonth();
        $to = Carbon::now()->endOfMonth();

        if( $stamp->date->isBefore($from) || $stamp->date->isAfter($to) )
            return redirect()->back()->with(['notistack' => ['error', 'Evento non più modificabile']]);

        $stamp->delete();

        return redirect()->back()->with(['notistack' => ['success', 'Evento eliminato']]);
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

        if ( Auth::user()->can('viewAny', Stamp::class) ) {
            $data = array_merge(
                Alumnus::whereHas('stamps', $stampsFilter)->with(['stamps' => $stampsFilter])->get()->all(),
                External::whereHas('stamps', $stampsFilter)->with(['stamps' => $stampsFilter])->get()->all(),
            );
        } else {
            $data = [
                Auth::user()->identity->load(['stamps' => $stampsFilter]),
            ];
        }

        array_walk($data, function (&$ident, $key) {
            $ident->stamps_grouped = $ident->stamps->groupBy(function ($item, $key) {
                return $item->date->day;
            });
            $ident = $ident->only(['id', 'surname', 'name', 'stamps_grouped']);
        });


        return Inertia::render('Clockings/Monthly', [
            'data' => $data,
            'year' => $year,
            'month' => $month
        ]);
    }
}
