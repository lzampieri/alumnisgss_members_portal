<?php

namespace App\Http\Controllers;

use App\Models\DynamicPermission;
use App\Models\Project;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function home()
    {
        // No authorization needed

        $projects = Project::all()->filter->canView->load('permissions')->append(['can_view', 'can_edit', 'running'])->values();
        $canCreate = Auth::check() && Auth::user()->can('create', Project::class);

        return Inertia::render(
            'Projects/Home',
            [
                'projects' => $projects,
                'canCreate' => $canCreate,
                'roles' => Role::where('name', '!=', 'webmaster')->orderBy('id')->get()
            ]
        );
    }

    public function edit(Request $request)
    {

        $validated = $request->validate([
            'id' => 'sometimes|nullable|numeric|exists:projects,id',
            'title' => 'required|string|min:3',
            'from' => 'required|date',
            'to' => 'required|date|after:from',
            'open' => 'required|boolean',
            'canView' => 'array|min:1',
            'canView.*' => 'integer|exists:roles,id',
            'canSee' => 'array',
            'canSee.*' => 'integer|exists:roles,id',
            'canApprove' => 'array',
            'canApprove.*' => 'integer|exists:roles,id',
            'canEdit' => 'array|min:1',
            'canEdit.*' => 'integer|exists:roles,id',
        ]);

        if (isset($validated['id'])) {
            // Update
            $project = Project::find($validated['id']);
            if (! $project) {
                return redirect()->back()->with(['notistack' => ['error', 'Progetto non trovato']]);
            }

            $this->authorize('edit', $project);

            $project->title = $validated['title'];
            $project->from = $validated['from'];
            $project->to = $validated['to'];
            $project->open = $validated['open'];
            $project->save();
        } else {
            $this->authorize('create', Project::class);

            $project = Project::create([
                'title' => $validated['title'],
                'from' => $validated['from'],
                'to' => $validated['to'],
                'open' => $validated['open']
            ]);
        }

        DynamicPermission::syncPermissions($project, 'view', $validated['canView']);
        DynamicPermission::syncPermissions($project, 'see', $validated['canSee']);
        DynamicPermission::syncPermissions($project, 'approve', $validated['canApprove']);
        DynamicPermission::syncPermissions($project, 'edit', $validated['canEdit']);

        return redirect()->back()->with(['notistack' => ['success', isset($validated['id']) ? 'Progetto aggiornato' : 'Progetto creato']]);
    }
}
