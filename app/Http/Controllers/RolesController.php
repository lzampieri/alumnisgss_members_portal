<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Document;
use App\Models\DynamicPermission;
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
            'name' => 'required|unique:roles,name',
            'common_name' => 'required|min:3',
            'canView' => 'sometimes|array',
            'canView.*' => 'integer|exists:roles,id',
            'canEdit' => 'sometimes|array',
            'canEdit.*' => 'integer|exists:roles,id',
        ]);

        $this->authorize('create', Role::class);

        $therole = Role::create($validated);

        // Save the canView
        if (in_array("canView", $validated)) {
            foreach ($validated['canView'] as $role) {
                $dynamicPermission = DynamicPermission::createFromRelations('view', $therole, Role::findById($role));
            }
        }

        // Save the canEdit
        if (in_array("canEdit", $validated)) {
            foreach ($validated['canEdit'] as $role) {
                $dynamicPermission = DynamicPermission::createFromRelations('edit', $therole, Role::findById($role));
            }
        }

        return redirect()->back();
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|exists:roles,name',
        ]);


        $role = Role::findByName($validated['name'])->load(['hasDynamicPermissions', 'permissableViaDynamicPermissions']);
        $this->authorize('edit', $role);

        $dynpers = $role->hasDynamicPermissions;
        foreach ($dynpers as $dynper)
            $dynper->delete();

        $dynpers = $role->permissableViaDynamicPermissions;
        foreach ($dynpers as $dynper)
            $dynper->delete();

        if ($role->isAutomatic) {
            return redirect()->back()->with(['notistack' => ['error', 'Non puoi eliminare un ruolo automatico']]);
        }

        $role->delete();

        return redirect()->back()->with(['notistack' => ['success', 'Ruolo eliminato']]);
    }



    public function add(Request $request)
    {
        $validated = $request->validate([
            'identity' => 'required|numeric',
            'type' => 'required|in:alumnus,external',
            'role' => 'required|numeric',
        ]);

        $identity = ($validated['type'] == 'alumnus' ? Alumnus::find($validated['identity']) : External::find($validated['identity']));
        if (! $identity) {
            return redirect()->back()->with(['notistack' => ['error', 'Identità non trovata']]);
        }

        $role = Role::findById($validated['role']);
        if (! $role) {
            return redirect()->back()->with(['notistack' => ['error', 'Ruolo non trovato']]);
        }



        $this->authorize('edit', $role);

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

        $identity = ($validated['type'] == 'alumnus' ? Alumnus::find($validated['identity']) : External::find($validated['identity']));
        if (! $identity) {
            return redirect()->back()->with(['notistack' => ['error', 'Identità non trovata']]);
        }

        $role = Role::findById($validated['role']);
        if (! $role) {
            return redirect()->back()->with(['notistack' => ['error', 'Ruolo non trovato']]);
        }

        $this->authorize('edit', $role);

        // One cannot remove the webmaster role from himself
        if ($role->name == 'webmaster' && Auth::user()->is($identity)) {
            return redirect()->back()->with(['notistack' => ['warning', 'Non puoi rimuovere il ruolo di webmaster da te stesso.']]);
        }

        $identity->removeRole($role);

        return redirect()->back()->with(['notistack' => ['success', 'Ruolo rimosso']]);
    }

    public function manage(?Role $role = null)
    {
        $this->authorize('groups-view');
        $roles = Role::with('permissions')->get()->append('is_automatic');
        $people = [];

        if ($role) {
            $role->append(['is_automatic', 'can_view', 'can_edit']);
            $role->load(['permissableViaDynamicPermissions', 'permissableViaDynamicPermissions.role']);

            if ($role->canView)
                $role->identities = Alumnus::role($role)->get()->concat(External::role($role)->get());

            if ($role->canEdit)
                $people = Alumnus::get()->concat(External::get());
        }

        return Inertia::render('Roles/Manage', ['roles' => $roles, 'role' => $role, 'people' => $people, 'canCreate' => Auth::user()->can('create', Role::class)]);
    }

    public function update_permissions(Request $request)
    {
        $validated = $request->validate([
            'roleId' => 'required|integer|exists:roles,id',
            'newList' => 'array',
            'newList.*' => 'integer|exists:roles,id',
            'type' => 'required|in:view,edit'
        ]);

        $therole = Role::find($validated['roleId']);

        $this->authorize('edit', $therole);

        $new_roles = $validated['newList'];
        $type = $validated['type'];

        $current_roles = $therole->permissableViaDynamicPermissions()->where('type', $type)->get()->pluck('role_id')->toArray();

        foreach (array_diff($current_roles, $new_roles) as $role) {
            // Roles to remove
            $dynamicPermission = $therole->permissableViaDynamicPermissions()->where('role_id', $role)->where('type', $type)->get();
            foreach ($dynamicPermission as $dp) {
                $dp->delete();
            }
        }
        foreach (array_diff($new_roles, $current_roles) as $role) {
            // Roles to add
            $dynamicPermission = DynamicPermission::createFromRelations($type, $therole, Role::findById($role));
        }

        return redirect()->back()->with(['notistack' => ['success', 'Permessi aggiornati']]);
    }
}
