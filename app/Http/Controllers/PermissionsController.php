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
use App\Models\Position;
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
        $roles = Role::with('permissions')->get()->append('is_automatic');
        $perms = Permission::orderBy('name')->get()->pluck('name');

        foreach ($roles as &$role) {
            $role->permissions_names = $role->permissions->pluck('name');
            $role->identities = Alumnus::role($role)->with('emails')->get()->concat(External::role($role)->with('emails')->get())->makeVisible('emails');
        }

        return Inertia::render('Permissions/List', ['roles' => $roles, 'perms' => $perms]);
    }

    public static function getAutomaticRoles()
    {
        $position_defined_roles = Position::select('type')->distinct()->get()->pluck('type')->toArray();
        return [
            ['webmaster', ...Alumnus::public_status, 'everyone', ...$position_defined_roles],
            ['WebMaster', ...array_map(fn($s) => Alumnus::AlumnusStatusLabels[$s], Alumnus::public_status), 'Tutti', ...$position_defined_roles]
        ];
    }

    public static function verify()
    {

        // ROLES

        $count_r_prev = Role::count();

        $autoRoles = PermissionsController::getAutomaticRoles();

        $roles_to_assert = [
            ...$autoRoles[0]
        ];
        $roles_to_assert_names = [
            ...$autoRoles[1]
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
            // Emails methods
            'emails-view-all',
            'emails-view-external',
            'emails-view-public-alumnus',
            'emails-add',
            'emails-edit',
            'emails-delete',
            // Contacts (emails sync)
            'login-lv2',
            'emails-sync',
            // Associate login methods and identities
            'emails-associate',
            'accesses-receive-request-emails',
            // Edit roles and permissions
            'permissions-view',
            'permissions-edit',
            'roles-edit',
            // Positions
            'positions-view-active',
            'positions-view-all',
            'positions-edit',
            // Network
            'network-view',
            'network-view-alldetails',
            'network-edit-view',
            'network-edit-consenting-alumnus',
            'network-edit-alumnus',
            // Cities
            'cities-edit',
            // Registry
            'alumnus-view-public',
            'alumnus-view-all',
            'alumnus-edit',
            'alumnus-import',
            'externals-view',
            // Ratifications
            'ratifications-view',
            'ratifications-edit',
            // Documents
            'documents-upload',
            'documents-edit',
            // Resources
            'resources-create',
            'resources-see-archive',
            'resources-view-all',
            'resources-edit-all',
            // Clockings
            'clockin',
            'clockin-view-all',
            'clockin-view-online',
            'clockin-edit-all',
            // Helpdesk
            'helpdesk-master',
            'helpdesk-solve-plain',
            // Newsletter
            'newsletters-create',
            'newsletters-master',
            'newsletters-send',
            'newsletters-send-server',
            //mailing list
            'mailinglists-view-all',
            'mailinglists-create',
            'mailinglists-edit-all',
            // Webmaster stuff
            'logfile-view',
            'logdb-view',
            'log-manage',
            'db-reset'
        ];


        // Roles edit
        foreach (Role::all()->pluck('name') as $role) {
            // never for Alumnus::public_status and everyone
            if (in_array($role, $autoRoles[0])) continue;
            $permissions_to_assert[] = 'user-edit-' . $role;
        }
        $permissions_to_assert[] = 'user-edit-webmaster';

        // Add permissions
        foreach ($permissions_to_assert as $permission) {
            try {
                Permission::findOrCreate($permission);
            } catch (\Illuminate\Database\QueryException $ex) {
                if ($ex->getCode() == 23000) {
                    Log::debug("Error 23000 in adding permission " . $permission . ", ignored", $ex->getCode());
                } else return redirect()->back()->with(['notistack' => ['error', "C'è stato un errore."]]);
            }
        }


        $count_p_added = Permission::count() - $count_p_prev;
        $count_p_deleted = 0;

        // Remove permissions
        foreach (Permission::where('guard_name', 'web')->get() as $permission) {
            if (!in_array($permission->name, $permissions_to_assert)) {
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
