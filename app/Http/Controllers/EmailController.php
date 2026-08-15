<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Models\Person;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailController extends Controller
{
    
    function manually_add_post(Request $request)
    {
        
        $validated = $request->validate([
            'address' => 'required|email|unique:emails,address',
            'identity' => 'required|numeric|exists:people,id'
        ]);

        $person = Person::find($validated['identity']);

        $this->authorize('editEmails', $person);

        if (! $person) {
            return redirect()->back()->with(['notistack' => ['error', 'Identità non trovata']]);
        }

        $person->emails()->create(['address' => $validated['address']]);

        return redirect()->back()->with(['notistack' => ['success', 'Aggiunto']]);
    } 

    function set_primary_post(Request $request)
    {
        
        $validated = $request->validate([
            'id' => 'required|numeric',
        ]);
        
        $e = Email::find($validated['id']);
        
        if( $e && $e->identity ) {
            
            $this->authorize('edit', $e);

            $e->primary = max( $e->identity->emails()->pluck('emails.primary')->toArray() ) + 1;
            $e->save();
            return redirect()->route('accesses')->with(['notistack' => ['success', 'Precedenza impostata']]);
        }
        return redirect()->back()->with(['notistack' => ['error', 'Indirizzo non trovato']]);
    }

    function delete_post(Request $request)
    {
        
        $validated = $request->validate([
            'id' => 'required|numeric',
        ]);

        $e = Email::find($validated['id']);
        
        if( $e ) {
            $this->authorize('delete', $e);

            $e->delete();
            return redirect()->route('accesses')->with(['notistack' => ['success', 'Cancellato']]);
        }
        return redirect()->back()->with(['notistack' => ['error', 'Indirizzo non trovato']]);
    }

    public function associate(Email $email)
    {
        $this->authorize('associate', Email::class);

        $email->makeVisible('created_at');

        return Inertia::render('Accesses/Associate', [
            'subject' => $email,
            'people' => Person::with('emails')->orderBy('surname')->orderBy('name')->get()->setVisible(['id','name','surname','coorte','emails','enabled']),
        ]);
    }

    function associate_post(Request $request, Email $email)
    {
        $this->authorize('associate', Email::class);

        $validated = $request->validate([
            'identity' => 'required|numeric|exists:people,id',
        ]);

        $identity = Person::find($validated['identity']);

        if( $identity ) {
            $email->identity()->associate($identity)->save();
            $email->identity->givePermissionTo('login');
            return redirect()->route('accesses')->with(['notistack' => ['success', 'Associato e abilitato']]);
        }

        return redirect()->back()->with(['notistack' => ['error', 'Identità non trovata']]);
    }

}
