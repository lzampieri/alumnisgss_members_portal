<?php

namespace App\Http\Controllers;

use App\Models\LoginMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginMethodController extends Controller
{
    public function list()
    {
        $this->authorize('viewAny', LoginMethod::class);
        $lmthds = LoginMethod::orderBy('credential')->with(['identity','identity.roles'])->get();

        $lmthds = $lmthds->map( function ( $lmthds ) { $lmthds['enabled'] = $lmthds->enabled(); return $lmthds; } );

        return Inertia::render('Accesses/List', ['lmthds' => $lmthds, 'editableRoles' => Auth::user()->identity->editableRoles() ]);
    }

    public function enabling(Request $request, User $user) {
        $this->authorize('enabling', User::class);        

        $validated = $request->validate([
            'enabled' => 'required|boolean'
        ]);

        if( $user->hasRole('webmaster') ) {
            return redirect()->back()->with( 'notistack', ['error','Impossibile disabilitare il webmaster']);
        }

        if( $user->enabled() && !$validated['enabled'] ) {
            Log::debug('User disabled', $user);
            $user->revokePermissionTo( 'login' );
        }
        
        if( !$user->enabled() && $validated['enabled'] ) {
            Log::debug('User enabled', $user);
            $user->givePermissionTo( 'login' );
        }
        
        return redirect()->back();
    }

    public function roles(Request $request, User $user) {
        
        $validated = $request->validate([
            'action' => 'required|in:add,remove',
            'role' => 'required|exists:roles,name'
        ]);
        
        $this->authorize( 'user-edit-' . $validated['role'] );

        if( $user->hasRole( $validated['role'] ) && $validated['action'] == 'remove' ) {
            Log::debug('User roles changed', [$user, $validated]);
            $user->removeRole( $validated['role'] );
        }

        if( !$user->hasRole( $validated['role'] ) && $validated['action'] == 'add' ) {
            Log::debug('User roles changed', [$user, $validated]);
            $user->assignRole( $validated['role'] );
        }
        
        return redirect()->back();
    }
}
