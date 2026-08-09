<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class IdentityController extends Controller
{
    public function list()
    {
        $this->authorize('viewAny', Email::class);

        $ems = [
            'people' => Person::with('emails')->orderBy('surname')->orderBy('name')->get()->setVisible(['id','name','surname','coorte','emails','enabled']),
            'requests' => Email::whereNull('identity_id')->orderBy('created_at', 'desc')->get(),
        ];

        foreach ($ems['people'] as $identity) {
            $identity->roles = $identity->getAllRoles();
            foreach ($identity->emails as $em) {
                $em->append('can_delete')->makeVisible('can_delete');
            }
            $identity->makeVisible('roles');
        }

        return Inertia::render('Accesses/List', [
            'list' => $ems,
            'editableRoles' => Auth::user()->editableRoles(),
            'canAssociate' => Auth::user()->can('associate', Email::class),
            'canAddEmails' => Auth::user()->can('add', Email::class),
            'canAddPeople' => Auth::user()->can('create', Person::class)
        ]);
    }

    public function enabled(Request $request)
    {
        $validated = $request->validate([
            'identity' => 'required|numeric|exists:people,id',
            'enabled' => 'required|boolean'
        ]);

        $identity = Person::find($validated['identity']);
        
        $this->authorize('enable', $identity);

        if (!$identity) {
            return redirect()->back()->with('notistack', ['error', 'Identità non trovata']);
        }

        if ($identity->hasRole('webmaster')) {
            return redirect()->back()->with('notistack', ['error', 'Impossibile disabilitare il webmaster']);
        }

        if ($identity->enabled && !$validated['enabled']) {
            $identity->revokePermissionTo('login');
        }

        if (!$identity->enabled && $validated['enabled']) {
            $identity->givePermissionTo('login');
        }

        return redirect()->back();
    }
}
