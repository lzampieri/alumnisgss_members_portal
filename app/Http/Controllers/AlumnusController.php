<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlumnusController extends Controller
{
    public function membersList() {
        $this->authorize( 'viewMembers', Alumnus::class );
        $members = Alumnus::where('status', Alumnus::Member )->orWhere('status', Alumnus::StudentMember )->orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Members/List', [ 'members' => $members ] );
    }

    public function list() {
        $this->authorize( 'viewAny', Alumnus::class );
        $alumni = Alumnus::orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Registry/List', [ 'alumni' => $alumni ] );
    }

    public function add() {
        $this->authorize( 'edit', Alumnus::class );

        return Inertia::render('Registry/Add' );
    }

    public function add_post(Request $request) {
        $this->authorize( 'edit', Alumnus::class );

        $validated = $request->validate([
            'surname'=> 'required|regex:/^[A-zÀ-ú\s]+$/',
            'name'=> 'required|regex:/^[A-zÀ-ú\s]+$/',
            'coorte'=> 'required|numeric',
            'status'=> 'required|numeric'
        ]);

        Alumnus::create( $validated );
        Log::debug( 'Alumnus created', $validated );

        return redirect()->route( 'registry' )->with( 'notistack', [ 'success', 'Inserimento riuscito' ]);
    }
    
    public function edit(Request $request, Alumnus $alumnus) {
        $this->authorize( 'edit', Alumnus::class );

        return Inertia::render('Registry/Edit', ['alumnus' => $alumnus] );
    }

    public function edit_post(Request $request, Alumnus $alumnus) {
        $this->authorize( 'edit', Alumnus::class );

        $validated = $request->validate([
            'surname'=> 'required|regex:/^[A-zÀ-ú\s]+$/',
            'name'=> 'required|regex:/^[A-zÀ-ú\s]+$/',
            'coorte'=> 'required|numeric',
            'status'=> 'required|numeric'
        ]);

        $alumnus->update( $validated );
        Log::debug( 'Alumnus updated', $validated );

        return redirect()->route( 'registry' )->with( 'notistack', [ 'success', 'Aggiornamento riuscito' ]);
    }
}
