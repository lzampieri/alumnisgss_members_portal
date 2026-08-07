<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class IdentityController extends Controller
{
    public function list()
    {
        $this->authorize('viewAny', Email::class);

        $ems = [
            'alumni' => Alumnus::has('emails')->with('emails')->orderBy('surname')->orderBy('name')->get()->makeVisible('emails'),
            'externals' => External::has('emails')->with('emails')->orderBy('surname')->orderBy('name')->get()->makeVisible('emails'),
            'requests' => Email::whereNull('identity_id')->orderBy('created_at', 'desc')->get(),
        ];

        foreach (['alumni', 'externals'] as $key) {
            foreach ($ems[$key] as $identity) {
                $identity->roles = $identity->getAllRoles();
                foreach( $identity->emails as $em ) {
                    $em->append('can_delete');
                }
                $identity->makeVisible('roles');
            }
        }

        return Inertia::render('Accesses/List', [
            'list' => $ems,
            'editableRoles' => Auth::user()->identity->editableRoles(),
            'canAssociate' => Auth::user()->can('associate', Email::class),
            'canAdd' => Auth::user()->can('add', Email::class)
        ]);
    }

    public function enabled(Request $request)
    {

        $validated = $request->validate([
            'identity' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'enabled' => 'required|boolean'
        ]);

        $classType = $validated['type'] == 'alumnus' ? Alumnus::class : External::class;

        $this->authorize('enable', $classType);

        $identity = $validated['type'] == 'alumnus' ? Alumnus::find($validated['identity']) : External::find($validated['identity']);

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
