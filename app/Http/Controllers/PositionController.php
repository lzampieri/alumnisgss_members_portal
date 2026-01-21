<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\Position;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\RoleDoesNotExist;

class PositionController extends Controller
{
    public function home()
    {
        $this->authorize('viewActive', Position::class);

        $positions = [];
        if (Auth::user()->can('viewAll', Position::class)) {
            $positions = Position::with('owner')->get();
        } else {
            $positions = Position::whereNowOrPast('from')->whereNowOrFuture('to')->with('owner')->get();
        }

        $positionable = [];
        if (Auth::user()->can('edit', Position::class)) {
            $positionable = [
                Alumnus::class => array_values(Alumnus::orderBy('surname')->orderBy('name')->get()->filter->canView->toArray()),
                External::class => array_values(External::orderBy('surname')->orderBy('name')->get()->filter->canView->toArray()),
            ];
        }

        return Inertia::render(
            'Positions/Home',
            [
                'positions' => $positions,
                'positionable' => $positionable,
                'canEdit' => Auth::user()->can('edit', Position::class)
            ]
        );
    }

    public function create(Request $request)
    {
        $this->authorize('edit', Position::class);

        $validated = $request->validate([
            'owner_type' => 'required|in:' . Alumnus::class . ',' . External::class,
            'owner_id' => 'required|numeric',
            'type' => 'required|string|min:3',
            'note' => 'nullable|string',
            'from' => 'required|date',
            'to' => 'required|date|after:from',
        ]);

        if ($validated['owner_type'] == Alumnus::class) {
            $identity = Alumnus::find($validated['owner_id']);
        } else {
            $identity = External::find($validated['owner_id']);
        }
        if (! $identity) {
            return redirect()->back()->withErrors(['owner_id' => ['Identità non trovata']])->withInput();
        }

        // Check that, if the role already exists, it is due to another position
        try {
            $prevrole = Role::findByName($validated['type']);
            $exists = Position::first('type', $validated['type']);
            if (!$exists)
                return redirect()->back()->withErrors(['type' => ['Un ruolo con questo nome esiste già, sorry']])->withInput();
        } catch (RoleDoesNotExist $e) {
        }

        // Create the position!
        $position = new Position();
        $position->type = $validated['type'];
        $position->note = $validated['note'];
        $position->from = $validated['from'];
        $position->to = $validated['to'];
        $position->owner()->associate($identity);
        $position->save();

        PermissionsController::verify();

        return redirect()->back()->with(['notistack' => ['success', 'Ruolo assegnato']]);
    }

    public function edit(Request $request, Position $position)
    {
        $this->authorize('edit', Position::class);

        $validated = $request->validate([
            'owner_type' => 'required|in:' . Alumnus::class . ',' . External::class,
            'owner_id' => 'required|numeric',
            'type' => 'required|string|min:3',
            'note' => 'nullable|string',
            'from' => 'required|date',
            'to' => 'required|date|after:from',
        ]);

        if ($validated['owner_type'] == Alumnus::class) {
            $identity = Alumnus::find($validated['owner_id']);
        } else {
            $identity = External::find($validated['owner_id']);
        }
        if (! $identity) {
            return redirect()->back()->withErrors(['owner_id' => ['Identità non trovata']])->withInput();
        }

        // Check that, if the role already exists, it is due to another position
        try {
            $prevrole = Role::findByName($validated['type']);
            $exists = Position::first('type', $validated['type']);
            if (!$exists)
                return redirect()->back()->withErrors(['type' => ['Un ruolo con questo nome esiste già, sorry']])->withInput();
        } catch (RoleDoesNotExist $e) {
        }

        // Create the position!
        $position->type = $validated['type'];
        $position->note = $validated['note'];
        $position->from = $validated['from'];
        $position->to = $validated['to'];
        $position->owner()->associate($identity);
        $position->save();

        PermissionsController::verify();

        return redirect()->back()->with(['notistack' => ['success', 'Ruolo modificato']]);
    }
}
