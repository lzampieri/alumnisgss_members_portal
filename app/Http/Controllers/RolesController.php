<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Document;
use App\Models\External;
use App\Models\Identity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\Exceptions\RoleDoesNotExist;
use App\Models\Permission;
use App\Models\Role;

class RolesController extends Controller
{
    public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:permissions,name',
            'common_name' => 'required|min:3'
        ]);

        $this->authorize('roles-edit');

        Role::create($validated);
        Permission::findOrCreate('user-edit-' . $validated['name'], 'web');

        // Assign all permissions to webmaster
        Role::findByName('webmaster')->givePermissionTo(Permission::all());

        return redirect()->back();
    }

    
    public function add(Request $request)
    {
        $validated = $request->validate([
            'identity' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'role' => 'required|numeric',
        ]);
        
        $identity = ( $validated['type'] == 'alumnus' ? Alumnus::find($validated['identity']) : External::find($validated['identity']) );
        if( ! $identity ) {
            return redirect()->back()->with(['notistack' => ['error', 'Identità non trovata']]);
        }
        
        $role = Role::findById($validated['role']);
        if( ! $role ) {
            return redirect()->back()->with(['notistack' => ['error', 'Ruolo non trovato']]);
        }

        $this->authorize('user-edit-' . $role->name);

        $identity->assignRole($role);

        return redirect()->back()->with(['notistack' => ['success', 'Ruolo assegnato']]);
    }
    
    public function remove(Request $request)
    {
        $validated = $request->validate([
            'identity' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'role' => 'required|numeric',
        ]);
        
        $identity = ( $validated['type'] == 'alumnus' ? Alumnus::find($validated['identity']) : External::find($validated['identity']) );
        if( ! $identity ) {
            return redirect()->back()->with(['notistack' => ['error', 'Identità non trovata']]);
        }
        
        $role = Role::findById($validated['role']);
        if( ! $role ) {
            return redirect()->back()->with(['notistack' => ['error', 'Ruolo non trovato']]);
        }

        $this->authorize('user-edit-' . $role->name);

        // One cannot remove the webmaster role from himself
        if( $role->name == 'webmaster' && Auth::user()->identity->is( $identity ) ) {
            return redirect()->back()->with(['notistack' => ['warning', 'Non puoi rimuovere il ruolo di webmaster da te stesso.']]);
        }

        $identity->removeRole($role);

        return redirect()->back()->with(['notistack' => ['success', 'Ruolo rimosso']]);
    }
}
