<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\LoginMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginMethodController extends Controller
{
    public function list()
    {
        $this->authorize('viewAny', LoginMethod::class);

        $lmthds = [
            'alumni' => Alumnus::has('loginMethods')->with(['loginMethods','roles'])->orderBy('surname')->orderBy('name')->get(),
            'externals' => External::has('loginMethods')->with(['loginMethods','roles'])->orderBy('surname')->orderBy('name')->get(),
            'requests' => LoginMethod::where('identity_id',null)->orderBy('created_at','desc')->get(),
        ];

        return Inertia::render('Accesses/List', ['lmthds' => $lmthds, 'editableRoles' => Auth::user()->identity->editableRoles() ]);
    }

    public function enabling(Request $request) {
        
        $validated = $request->validate([
            'id' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'enabled' => 'required|boolean'
        ]);

        $classType = $validated['type'] == 'alumnus' ? Alumnus::class : External::class;

        $this->authorize('enable', $classType);        

        $identity = $validated['type'] == 'alumnus' ? Alumnus::find( $validated['id'] ) : External::find( $validated['id'] );

        if( !$identity ) {
            return redirect()->back()->with( 'notistack', ['error','Identità non trovata']);
        }

        if( $identity->hasRole('webmaster') ) {
            return redirect()->back()->with( 'notistack', ['error','Impossibile disabilitare il webmaster']);
        }

        if( $identity->enabled && !$validated['enabled'] ) {
            Log::debug('Identity disabled', $identity);
            $identity->revokePermissionTo( 'login' );
        }
        
        if( !$identity->enabled && $validated['enabled'] ) {
            Log::debug('Identity enabled', $identity);
            $identity->givePermissionTo( 'login' );
        }
        
        return redirect()->back();
    }

    public function delete(Request $request, LoginMethod $lmth) {
        
        $this->authorize('edit', $lmth);
        $same = ($lmth->id == Auth::user()->id);

        Log::debug('Login method deleted', $lmth);
        $lmth->delete();

        if( $same ) {
            Auth::logout();
            return redirect()->route('home');
        }
        
        return redirect()->back();
    }

    public function edit_roles(Request $request) {
        
        $validated = $request->validate([
            'id' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'action' => 'required|in:add,remove',
            'role' => 'required|exists:roles,name'
        ]);
        
        $this->authorize( 'user-edit-' . $validated['role'] );

        $identity = $validated['type'] == 'alumnus' ? Alumnus::find( $validated['id'] ) : External::find( $validated['id'] );

        if( $identity->hasRole( $validated['role'] ) && $validated['action'] == 'remove' ) {
            Log::debug('Identity roles changed', [$identity, $validated]);
            $identity->removeRole( $validated['role'] );
        }

        if( !$identity->hasRole( $validated['role'] ) && $validated['action'] == 'add' ) {
            Log::debug('Identity roles changed', [$identity, $validated]);
            $identity->assignRole( $validated['role'] );
        }
        
        return redirect()->back();
    }
}
