<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsController extends Controller
{
    public function list()
    {
        try {
            Permission::findByName('permissions-view');
        } catch (PermissionDoesNotExist $e) {
            Log::debug('Automatically created permissions-view and permissions-edit', []);
            Permission::findOrCreate('permissions-view');
            Permission::findOrCreate('permissions-edit');
            Role::findByName('webmaster')->givePermissionTo(Permission::all());
        }

        $this->authorize('permissions-view');
        $roles = Role::with('permissions')->get();
        $perms = Permission::all()->pluck('name');

        foreach ($roles as &$role) {
            $role->permissions_names = $role->permissions->pluck('name');
        }

        return Inertia::render('Permissions/List', ['roles' => $roles, 'perms' => $perms]);
    }

    public static function verify()
    {

        // ROLES

        $count_r = Role::count();

        $roles_to_assert = [
            'secretariat',
            'webmaster',
            'member',
            'student_member'
        ];

        // Find or create!
        foreach ($roles_to_assert as $role)
            Role::findOrCreate($role);

        $count_r = Role::count() - $count_r;


        // PERMISSIONS

        $count_p = Permission::count();

        $permissions_to_assert = [
            // Users
            'login',
            'logins-view',
            'logins-edit',
            'identity-alumni-enabling',
            'identity-externals-enabling',
            'accesses-associate',
            'accesses-receive-request-emails',
            // Edit roles and permissions
            'permissions-view',
            'permissions-edit',
            // Log
            'log-manage',
            // Registry
            'alumnus-view',
            'alumnus-edit',
            'alumnus-bulk',
            // Ratifications
            'ratifications-view',
            'ratifications-edit',
            'ratifications-bypass',
            // Documents
            'documents-upload',
            'documents-edit'
        ];

        // Roles edit
        foreach (Role::all()->pluck('name') as $role) {
            // never for members and student members
            if ($role == 'member' || $role == 'student_member') continue;
            $permissions_to_assert[] = 'user-edit-' . $role;
        }

        // Document privacies
        foreach (Document::$privacies as $privacy) {
            if ($privacy == 'everyone') continue;
            $permissions_to_assert[] = 'documents-view-' . $privacy;
        }

        // Find or create!
        foreach ($permissions_to_assert as $permission)
            Permission::findOrCreate($permission);

        $count_p = Permission::count() - $count_p;

        if ($count_p == 0)
            return redirect()->back()->with(['notistack' => ['success', 'Permessi e ruoli corretti']]);
        return redirect()->back()->with(['notistack' => ['warning', $count_p . ' permessi aggiunti, ' . $count_r . ' ruoli aggiunti']]);
    }

    public function update(Request $request)
    {

        $validated = $request->validate([
            'action' => 'required|in:add,remove',
            'role' => 'required|exists:roles,name',
            'permission' => 'required|exists:permissions,name'
        ]);

        $this->authorize('permissions-edit');

        if ($validated['permission'] == 'login')
            return redirect()->back()->with(['notistack' => ['error', 'Il permesso di login non è assegnabile direttamente ad un ruolo']]);

        if ($validated['role'] == 'webmaster') {
            Role::findByName('webmaster')->syncPermissions(Permission::all());
            Log::debug('All permissions assigned to webmaster', Permission::all());
            return redirect()->back()->with(['notistack' => ['success', 'Tutti i permessi assegnati al webmaster']]);
        }

        $role = Role::findByName($validated['role']);
        if ($role->hasPermissionTo($validated['permission']) && $validated['action'] == 'remove') {
            Log::debug('Permission changed', $validated);
            $role->revokePermissionTo($validated['permission']);
        }
        if (!$role->hasPermissionTo($validated['permission']) && $validated['action'] == 'add') {
            Log::debug('Permission changed', $validated);
            $role->givePermissionTo($validated['permission']);
        }

        return redirect()->back();
    }

    public function add(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|unique:permissions,name'
        ]);

        $this->authorize('permissions-edit');

        Log::debug('New permission created', $validated);
        Permission::create($validated);

        return redirect()->back();
    }
}
