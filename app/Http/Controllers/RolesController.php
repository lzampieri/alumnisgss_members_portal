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
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    public function add(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:permissions,name',
            'common_name' => 'required|min:3'
        ]);

        $this->authorize('roles-edit');

        Log::debug('New role created', $validated);
        Role::create($validated);
        Permission::findOrCreate('user-edit-' . $validated['name'], 'web');

        // Assign all permissions to webmaster
        Role::findByName('webmaster')->givePermissionTo(Permission::all());

        return redirect()->back();
    }
}
