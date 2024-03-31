<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Identity;
use App\Models\IdentityDetail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AlumnusController extends Controller
{
    public function membersList()
    {
        $this->authorize('viewMembers', Alumnus::class);

        $data = Alumnus::whereIn('status', Alumnus::public_status)
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->groupBy('coorte');
        $counts = Alumnus::select('status', DB::raw('COUNT(*) as count'))
            ->whereIn('status', Alumnus::public_status)
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Members/List', ['data' => $data, 'counts' => $counts]);
    }

    public function membersCounters()
    {
        $this->authorize('viewMembers', Alumnus::class);
        $members = Alumnus::where('status', 'member')->count();
        $students = Alumnus::where('status', 'student_member')->count();

        return response()->json([
            'members' => $members,
            'student_members' => $students
        ]);
    }

    private function commonRegistryParams()
    {
        return [
            'canImport' => Auth::user()->can('import', Alumnus::class),
        ];
    }

    public function schema()
    {
        $this->authorize('viewAny', Alumnus::class);


        $data = Alumnus::orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->append('pending_ratifications')
            ->groupBy('coorte');

        return Inertia::render(
            'Registry/Schema',
            [
                'data' => $data,
            ] + $this->commonRegistryParams()
        );
    }

    public function table()
    {
        $this->authorize('viewAny', Alumnus::class);

        $data = Alumnus::orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->with('details')
            ->get()
            ->append('pending_ratifications');

        return Inertia::render(
            'Registry/Table',
            [
                'data' => $data,
                'detailsTitles' => array_keys(IdentityDetail::allDetails())
            ] + $this->commonRegistryParams()
        );
    }

    public function edit(Request $request, ?Alumnus $alumnus = null)
    {
        $this->authorize('edit', Alumnus::class);

        if ($alumnus)
            $alumnus->load(['details', 'ratifications', 'ratifications.document']);

        return Inertia::render('Registry/Edit', [
            'alumnus' => $alumnus,
            'availableStatus' => Alumnus::availableStatus($alumnus),
            'allTags' => Alumnus::allTags(),
            'allDetails' => IdentityDetail::allDetails()
        ]);
    }

    public function edit_post(Request $request, ?Alumnus $alumnus = null)
    {
        $this->authorize('edit', Alumnus::class);
        $update = false;

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'coorte' => 'required|numeric',
            'status' => 'required|in:' . implode(',', Alumnus::availableStatus($alumnus)),
            'tags' => 'nullable|array',
            'details' => 'nullable|array',
            'details.*' => 'nullable|array',
            'details.*.delete' => 'nullable|boolean',
            'details.*.key' => 'exclude_if:details.*.delete,true|required|min:3|max:100|distinct',
            'details.*.value' => 'exclude_if:details.*.delete,true|nullable',
        ]);

        // Check for errors on the details, e.g. switching the names of two keys
        if ($alumnus) {
            $details_errors = [];
            foreach ($validated['details'] as $idx => $detail) {
                if ($detail['delete'] ?? false) continue;

                $others = $alumnus->details->where('key', $detail['key'])->where('id', '!=', $detail['id'] ?? -1)->count();
                if ($others > 0)
                    $details_errors['details.' . $idx . '.key'] = "Esiste già un dettaglio con questo nome";
            }
            if (count($details_errors) > 0) {
                return back()->withErrors($details_errors);
            }
        }

        if ($alumnus) {
            $alumnus->update($validated);
            Log::debug('Alumnus updated', $validated);
            $update = true;
        } else {
            $alumnus = Alumnus::create($validated);
            Log::debug('Alumnus created', $validated);
        }

        // Go with order: firstly, trash the one which should be trashed
        foreach ($validated['details'] as $detail) {
            if (($detail['id'] ?? -1) >= 0 && ($detail['delete'] ?? false)) {
                $det = IdentityDetail::find($detail['id']);
                if ($det) {
                    Log::debug("Deleted detail", $det);
                    $det->delete();
                }
            }
        }

        // Now, update existing details and create new ones
        foreach ($validated['details'] as $detail) {
            if ($detail['delete'] ?? false) continue; // skip deletes

            // If already existing, update
            if (($detail['id'] ?? -1) >= 0) {
                $det = IdentityDetail::find($detail['id']);

                // If update is needed...
                if ($det->key == $detail['key'] && $det->value == $detail['value']) continue;

                // Check if there is a trashed detail with the same name
                $trashed = $alumnus->details()->onlyTrashed()->where('key', $detail['key'])->first();
                if ($trashed) {
                    Log::debug("Detail deleted to be replaced", $det);
                    $det->delete();
                    $trashed->restore();
                    $trashed->value = $detail['value'];
                    $trashed->save();
                    Log::debug("Detail restored and updated as a replacement", $trashed);
                } else {
                    $det->update(['key' => $detail['key'], 'value' => $detail['value']]);
                    Log::debug("Updated detail", $detail);
                }
            } else {
                // New details must be created
                // Check if there is already a trashed detail with the same name
                $trashed = $alumnus->details()->onlyTrashed()->where('key', $detail['key'])->first();
                if ($trashed) {
                    $trashed->restore();
                    $trashed->value = $detail['value'];
                    $trashed->save();
                    Log::debug("Detail restored and updated", $trashed);
                } else {
                    $alumnus->details()->create(['key' => $detail['key'], 'value' => $detail['value']]);
                    Log::debug("New detail created", $detail);
                }
            }
        }

        return redirect()->route('registry.edit', ['alumnus' => $alumnus])->with('notistack', ['success', $update ? 'Alumno aggiornato' : 'Alumno creato']);
    }
}
