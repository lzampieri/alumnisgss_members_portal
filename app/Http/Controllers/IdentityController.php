<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\LoginMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class IdentityController extends Controller
{
    public function enabling(Request $request)
    {

        $validated = $request->validate([
            'id' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'enabled' => 'required|boolean'
        ]);

        $classType = $validated['type'] == 'alumnus' ? Alumnus::class : External::class;

        $this->authorize('enable', $classType);

        $identity = $validated['type'] == 'alumnus' ? Alumnus::find($validated['id']) : External::find($validated['id']);

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

    public function edit_roles(Request $request)
    {

        $validated = $request->validate([
            'id' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'action' => 'required|in:add,remove',
            'role' => 'required|exists:roles,name'
        ]);

        $this->authorize('user-edit-' . $validated['role']);

        $identity = $validated['type'] == 'alumnus' ? Alumnus::find($validated['id']) : External::find($validated['id']);

        if ($identity->hasRole($validated['role']) && $validated['action'] == 'remove') {
            $identity->removeRole($validated['role']);
        }

        if (!$identity->hasRole($validated['role']) && $validated['action'] == 'add') {
            $identity->assignRole($validated['role']);
        }

        return redirect()->back();
    }
}
