<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\Identity;
use App\Models\IdentityDetail;
use App\Models\Ratification;
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
        $alumni = Alumnus::whereIn('status', Alumnus::public_status)
            ->where('coorte', '>', 0)
            ->with(['aDetails' => function ($query) {
                $query->whereHas('aDetailsType', function ($query) {
                    $query->where('visible', true);
                })->orderBy(ADetailsType::select('order')->whereColumn('a_details_types.id', 'a_details.a_details_type_id'));
            }, 'aDetails.aDetailsType'])
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->append('a_details_keyd');
        $adtlist = ADetailsType::allOrdered();

        return Inertia::render(
            'Registry/Table',
            [
                'data' => $alumni,
                'adtlist' => $adtlist,
            ] + $this->commonRegistryParams()
        );
    }

    public function edit(Request $request, ?Alumnus $alumnus = null)
    {
        $this->authorize('edit', Alumnus::class);

        $adtlist = ADetailsType::allOrdered();

        if ($alumnus) {
            $alumnus->load(['details', 'ratifications', 'ratifications.document']);
            $adtlist->load(['aDetails' => function ($query) use ($alumnus) {
                $query->where('identity_type', Alumnus::class)->where('identity_id', $alumnus->id);
            }]);
        }

        $adtlist->append('usedValues');

        return Inertia::render('Registry/Edit', [
            'alumnus' => $alumnus,
            'adts' => $adtlist,
            'noRatStatus' => Alumnus::availableStatus($alumnus),
            'allStatus' => Alumnus::status,
            'allTags' => Alumnus::allTags(),
            'pendingRats' => $alumnus ? $alumnus->pending_ratifications_list : null,
        ]);
    }

    public function edit_post(Request $request, ?Alumnus $alumnus = null)
    {
        $this->authorize('edit', Alumnus::class);
        $update = false;
        $was_update = !!$alumnus;

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'coorte' => 'required|numeric',
            'status' => 'required|in:' . implode(',', Alumnus::status),
            'tags' => 'nullable|array',
            'adts' => 'array',
            'adts.*' => 'array',
            'adts.*.id' => 'required|distinct|exists:a_details_types,id',
            'adts.*.value' => 'nullable|array',
        ]);

        // Check for new status, if ratification needed
        $rat_needed = false;
        $rat_newstatus = '';
        if (!in_array($validated['status'], Alumnus::availableStatus($alumnus))) {
            $rat_needed = true;
            $rat_newstatus = $validated['status'];
            $validated['status'] = $alumnus ? $alumnus->status : 'not_reached';
        }

        // Create or update alumnus
        if ($alumnus) {
            foreach (['surname', 'name', 'coorte', 'status', 'tags'] as $key) {
                if ($validated[$key] !== $alumnus[$key]) {
                    $alumnus[$key] = $validated[$key];
                    $update = true;
                }
            }
            if ($update) $alumnus->save();
        } else {
            $alumnus = Alumnus::create($validated);
        }

        // Eventually create ratification
        if ($rat_needed) {
            // Check for existing ratifications
            foreach ($alumnus->pending_ratifications_list as $pr) {
                if ($pr->required_state == $rat_newstatus) {
                    $rat_needed = false;
                    break;
                }
            }
            if ($rat_needed) {
                Ratification::create(['alumnus_id' => $alumnus->id, 'required_state' => $rat_newstatus]);
            }
        }

        // Update ADetails
        foreach ($validated['adts'] as $adts) {
            $alumnus->aDetails()->updateOrCreate(
                ['a_details_type_id' => $adts['id']],
                ['value' => $adts['value']]
            );
        }

        return redirect()->route('registry.edit', ['alumnus' => $alumnus])->with('notistack', ['success', $was_update ? 'Alumno aggiornato' : 'Alumno creato']);
    }
}
