<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Ratification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RatificationController extends Controller
{
    public function list()
    {
        $this->authorize('view', Ratification::class);

        return Inertia::render('Ratifications/List', []);
    }

    
    public function add()
    {
        $this->authorize('edit', Ratification::class);

        return Inertia::render('Ratifications/Add', [
            'alumni' => Alumnus::with('ratifications')->get(),
            'possibleStatus' => Alumnus::require_ratification
        ]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('edit', Alumnus::class);

        $validated = $request->validate([
            'alumnus_id' => 'required|exists:alumni,id',
            'required_state' => 'required|in:' . implode(',', Alumnus::require_ratification )
        ]);

        Ratification::create( $validated );
        Log::debug('Ratification created', $validated);

        return redirect()->route('ratifications')->with('notistack', ['success', 'Inserimento riuscito']);
    }

}
