<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmailController extends Controller
{
    
    function manually_add_post(Request $request)
    {
        $this->authorize('add', Email::class);
        
        $validated = $request->validate([
            'address' => 'required|email|unique:emails,address',
            'comment' => 'string|nullable'
        ]);

        Email::create($validated);

        return redirect()->back()->with(['notistack' => ['success', 'Aggiunto']]);
    } 

    function delete_post(Request $request)
    {
        $this->authorize('add', Email::class);
        
        $validated = $request->validate([
            'id' => 'required|numeric',
        ]);

        $e = Email::find($validated['id']);
        
        if( $e ) {
            $e->delete();
            return redirect()->route('accesses')->with(['notistack' => ['success', 'Cancellato']]);
        }
        return redirect()->back()->with(['notistack' => ['error', 'Indirizzo non trovato']]);
    }

    public function associate(Email $email)
    {
        $this->authorize('associate', Email::class);

        $ems = [
            'alumni' => Alumnus::with('emails')->orderBy('surname')->orderBy('name')->get(),
            'externals' => External::with('emails')->orderBy('surname')->orderBy('name')->get()
        ];

        return Inertia::render('Accesses/Associate', [
            'subject' => $email,
            'list' => $ems,
        ]);
    }

    function associate_post(Request $request, Email $email)
    {
        $this->authorize('associate', Email::class);

        $validated = $request->validate([
            'identity' => 'required|numeric',
            'type' => 'required|in:alumnus,external'
        ]);

        $identity = ( $validated['type'] == 'alumnus' ? Alumnus::find($validated['identity']) : External::find($validated['identity']) );

        if( $identity ) {
            $email->identity()->associate($identity)->save();
            $email->identity()->givePermissionTo('login');
            return redirect()->route('accesses')->with(['notistack' => ['success', 'Associato e abilitato']]);
        }

        return redirect()->back()->with(['notistack' => ['error', 'Identità non trovata']]);
    }

}
