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

class PermissionsController extends Controller
{
    public function list()
    {
        try {
            Permission::findByName('permissions-view');
        } catch (PermissionDoesNotExist $e) {
            Permission::findOrCreate('permissions-view');
            Permission::findOrCreate('permissions-edit');
            Role::findByName('webmaster')->givePermissionTo(Permission::all());
        }

        $this->authorize('permissions-view');
        $roles = Role::with('permissions')->get();
        $perms = Permission::all()->pluck('name');

        foreach ($roles as &$role) {
            $role->permissions_names = $role->permissions->pluck('name');
            $role->identities = Alumnus::role($role)->get()->concat(External::role($role)->get());
        }

        return Inertia::render('Permissions/List', ['roles' => $roles, 'perms' => $perms]);
    }

    public static function verify()
    {

        // ROLES

        $count_r_prev = Role::count();

        $roles_to_assert = [
            'webmaster',
            'secretariat',
            'cda',
            'member',
            'student_member',
            'everyone'
        ];
        $roles_to_assert_names = [
            'WebMaster',
            'Segreteria',
            'Consiglio di Amministrazione',
            'Socio',
            'Socio studente',
            'Tutti'
        ];

        // Find or create!
        foreach ($roles_to_assert as $index => $role) {
            try {
                Role::findByName($role);
            } catch (RoleDoesNotExist $th) {
                Role::create(['name' => $role, 'common_name' => $roles_to_assert_names[$index]]);
            }
        }

        $count_r_added = Role::count() - $count_r_prev;


        // PERMISSIONS

        $count_p_prev = Permission::count();

        $permissions_to_assert = [
            // Identities
            'login',
            'identity-alumni-enabling',
            'identity-externals-enabling',
            // Login methods
            'logins-view',
            'logins-add',
            'logins-delete',
            // Associate login methods and identities
            'accesses-associate',
            'accesses-receive-request-emails',
            // Edit roles and permissions
            'permissions-view',
            'permissions-edit',
            'roles-edit',
            // Network
            'network-view',
            'network-edit-view',
            'network-edit-alumnus',
            // Registry
            'alumnus-view',
            'alumnus-edit',
            'alumnus-import',
            // Ratifications
            'ratifications-view',
            'ratifications-edit',
            // Documents
            'documents-upload',
            'documents-edit',
            // Resources
            'resources-create',
            // Clockings
            'clockin',
            'clockin-view-all',
            'clockin-view-online',
            'clockin-edit-all',
            // Webmaster stuff
            'logfile-view',
            'logdb-view',
            'log-manage',
            'db-reset'
        ];

        // Roles edit
        foreach (Role::all()->pluck('name') as $role) {
            // never for members and student members and anyone
            if ($role == 'member' || $role == 'student_member' || $role == 'everyone') continue;
            $permissions_to_assert[] = 'user-edit-' . $role;
        }

        // Add permissions
        foreach ($permissions_to_assert as $permission) {
            try {
                Permission::findOrCreate($permission);
            } catch(\Illuminate\Database\QueryException $ex){
                if( $ex->getCode() == 23000 ) {
                    Log::debug("Error 2300 in adding permission " . $permission . ", ignored", $ex->getCode() );
                }
                else return redirect()->back()->with(['notistack' => ['error', "C'è stato un errore."]]);
            }
        }

        $count_p_added = Permission::count() - $count_p_prev;
        $count_p_deleted = 0;

        // Remove permissions
        foreach(Permission::where('guard_name','web')->get() as $permission) {
            if( !in_array( $permission->name, $permissions_to_assert ) ) {
                $permission->delete();
                $count_p_deleted++;
            }
        }

        // Assign permissions to roles
        Role::findByName('webmaster')->givePermissionTo(Permission::all());

        if ($count_p_added + $count_r_added + $count_p_deleted == 0)
            return redirect()->back()->with(['notistack' => ['success', 'Permessi e ruoli corretti']]);
        return redirect()->back()->with(['notistack' => ['warning', $count_p_added . ' permessi aggiunti, ' . $count_p_deleted . ' permessi rimossi, ' . $count_r_added . ' ruoli aggiunti']]);
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

        if (($validated['role'] == 'webmaster') && !(Auth::user()->identity->hasRole('webmaster'))) {
            Role::findByName('webmaster')->syncPermissions(Permission::all());
            LogController::log(LogEvents::PERMISSION_GIVEN, Role::findByName('webmaster'), 'permission', Null, Permission::all());
            return redirect()->back()->with(['notistack' => ['success', 'Tutti i permessi assegnati al webmaster']]);
        }

        $role = Role::findByName($validated['role']);
        if ($role->hasPermissionTo($validated['permission']) && $validated['action'] == 'remove') {
            $role->revokePermissionTo($validated['permission']);
        }
        if (!$role->hasPermissionTo($validated['permission']) && $validated['action'] == 'add') {
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

        Permission::findOrCreate($validated['name'], 'web');

        return redirect()->back();
    }
}
