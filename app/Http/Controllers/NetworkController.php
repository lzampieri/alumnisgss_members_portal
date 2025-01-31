<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\ArrayableDetail;
use App\Models\ArrayableDetailsType;
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

class NetworkController extends Controller
{
    public function list()
    {
        $this->authorize('viewNetwork', Alumnus::class);

        $alumni = Alumnus::whereIn('status', Alumnus::public_status)
            ->where('coorte','>',0)
            ->with(['arrayableDetails'])
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get();

        return Inertia::render('Network/List', [
            'alumni' => $alumni,
            'canEditView' => Auth::user()->can('editNetworkView', Alumnus::class)
        ]);
    }

    public function settings()
    {
        $this->authorize('editNetworkView', Alumnus::class);

        return Inertia::render('Network/Settings', [
            'arrayableDetailsTypes' => ArrayableDetailsType::allOrdered()
        ]);
    }

    public function adtedit(Request $request)
    {
        $this->authorize('editNetworkView', Alumnus::class);
        $update = false;
        
        $validated = $request->validate([
            'id' => 'numeric',
            'name' => 'required|regex:/^[A-zÀ-ú\d\s\'_:,]+$/',
            'separators' => 'present',
            'order' => 'required|numeric',
            'visible' => 'required|boolean',
        ]);
        
        if( $validated['id'] && ArrayableDetailsType::find($validated['id']) ) {
            $update = true;

            $adt = ArrayableDetailsType::find($validated['id']);
            $adt->name = $validated['name'];
            $adt->separators = $validated['separators'];
            $adt->order = $validated['order'];
            $adt->visible = $validated['visible'];
            $adt->save();
        } else {
            ArrayableDetailsType::create($validated);
        }

        return redirect()->back()->with(['notistack' => ['success', $update ? 'Modificato' : 'Inserito']]);
    }

    public function adtdelete(Request $request)
    {
        $this->authorize('editNetworkView', Alumnus::class);

        $validated = $request->validate([
            'id' => 'required|numeric',
        ]);

        if( $validated['id'] && ArrayableDetailsType::find($validated['id']) ) {
            $adt = ArrayableDetailsType::find($validated['id']);
            $adt->delete();
            return redirect()->back()->with(['notistack' => ['success', 'Eliminato']]);
        }

        return redirect()->back()->with(['notistack' => ['error', 'Qualcosa è andato storto']]);
    }

    public function edit(Request $request, Alumnus $alumnus)
    {
        $this->authorize('editNetworkAlumnus', Alumnus::class);

        $adtlist = ArrayableDetailsType::visibleOrdered();
        $adtlist->load(['arrayableDetails' => function ($query) use ($alumnus) {
            $query->where('identity_type', Alumnus::class)->where('identity_id', $alumnus->id);
        }]);

        return Inertia::render('Network/Edit', [
            'alumnus' => $alumnus,
            'adts' => $adtlist
        ]);
    }

    
    public function edit_post(Request $request, Alumnus $alumnus)
    {
        $this->authorize('editNetworkAlumnus', Alumnus::class);

        $validated = $request->validate([
            'adts' => 'array',
            'adts.*' => 'array',
            'adts.*.id' => 'required|distinct|exists:arrayable_details_types,id',
            'adts.*.value' => 'nullable|array',
        ]);

        foreach ($validated['adts'] as $adts) {
            $alumnus->arrayableDetails()->updateOrCreate(
                [ 'arrayable_details_type_id' => $adts['id'] ],
                [ 'value' => $adts['value'] ]
            );
        }

    //     // Check for errors on the details, e.g. switching the names of two keys
    //     if ($alumnus) {
    //         $details_errors = [];
    //         foreach ($validated['details'] as $idx => $detail) {
    //             if ($detail['delete'] ?? false) continue;

    //             $others = $alumnus->details->where('key', $detail['key'])->where('id', '!=', $detail['id'] ?? -1)->count();
    //             if ($others > 0)
    //                 $details_errors['details.' . $idx . '.key'] = "Esiste già un dettaglio con questo nome";
    //         }
    //         if (count($details_errors) > 0) {
    //             return back()->withErrors($details_errors);
    //         }
    //     }

    //     // Check for new status, if ratification needed
    //     $rat_needed = false;
    //     $rat_newstatus = '';
    //     if (!in_array($validated['status'], Alumnus::availableStatus($alumnus))) {
    //         $rat_needed = true;
    //         $rat_newstatus = $validated['status'];
    //         $validated['status'] = $alumnus ? $alumnus->status : 'not_reached';
    //     }

    //     // Create or update alumnus
    //     if ($alumnus) {
    //         foreach (['surname', 'name', 'coorte', 'status', 'tags', 'academic', 'realjobs'] as $key) {
    //             if ($validated[$key] !== $alumnus[$key]) {
    //                 $alumnus[$key] = $validated[$key];
    //                 $update = true;
    //             }
    //         }
    //         if ($update) $alumnus->save();
    //     } else {
    //         $alumnus = Alumnus::create($validated);
    //     }

    //     // Eventually create ratification
    //     if ($rat_needed) {
    //         // Check for existing ratifications
    //         foreach ($alumnus->pending_ratifications_list as $pr) {
    //             if ($pr->required_state == $rat_newstatus) {
    //                 $rat_needed = false;
    //                 break;
    //             }
    //         }
    //         if ($rat_needed) {
    //             Ratification::create(['alumnus_id' => $alumnus->id, 'required_state' => $rat_newstatus]);
    //         }
    //     }

    //     // Go with order: firstly, trash the one which should be trashed
    //     foreach ($validated['details'] as $detail) {
    //         if (($detail['id'] ?? -1) >= 0 && ($detail['delete'] ?? false)) {
    //             $det = IdentityDetail::find($detail['id']);
    //             if ($det) {
    //                 $det->delete();
    //             }
    //         }
    //     }

    //     // Now, update existing details and create new ones
    //     foreach ($validated['details'] as $detail) {
    //         if ($detail['delete'] ?? false) continue; // skip deletes

    //         // If already existing, update
    //         if (($detail['id'] ?? -1) >= 0) {
    //             $det = IdentityDetail::find($detail['id']);

    //             // If update is needed...
    //             if ($det->key == $detail['key'] && $det->value == $detail['value']) continue;

    //             // Check if there is a trashed detail with the same name
    //             $trashed = $alumnus->details()->onlyTrashed()->where('key', $detail['key'])->first();
    //             if ($trashed) {
    //                 $det->delete();
    //                 $trashed->restore();
    //                 $trashed->value = $detail['value'];
    //                 $trashed->save();
    //             } else {
    //                 $det->update(['key' => $detail['key'], 'value' => $detail['value']]);
    //             }
    //         } else {
    //             // New details must be created
    //             // Check if there is already a trashed detail with the same name
    //             $trashed = $alumnus->details()->onlyTrashed()->where('key', $detail['key'])->first();
    //             if ($trashed) {
    //                 $trashed->restore();
    //                 $trashed->value = $detail['value'];
    //                 $trashed->save();
    //             } else {
    //                 $alumnus->details()->create(['key' => $detail['key'], 'value' => $detail['value']]);
    //             }
    //         }
    //     }

        return redirect()->route('network')->with(['notistack' => ['success', 'Salvato!']]);
    }


    // private function commonRegistryParams()
    // {
    //     return [
    //         'canImport' => Auth::user()->can('import', Alumnus::class),
    //     ];
    // }

    // public function schema()
    // {
    //     $this->authorize('viewAny', Alumnus::class);


    //     $data = Alumnus::orderBy('coorte')
    //         ->orderBy('surname')->orderBy('name')
    //         ->get()
    //         ->append('pending_ratifications')
    //         ->groupBy('coorte');

    //     return Inertia::render(
    //         'Registry/Schema',
    //         [
    //             'data' => $data,
    //         ] + $this->commonRegistryParams()
    //     );
    // }

    // public function table()
    // {
    //     $this->authorize('viewAny', Alumnus::class);

    //     $data = Alumnus::orderBy('coorte')
    //         ->orderBy('surname')->orderBy('name')
    //         ->with('details')
    //         ->get()
    //         ->append('pending_ratifications');

    //     return Inertia::render(
    //         'Registry/Table',
    //         [
    //             'data' => $data,
    //             'detailsTitles' => array_keys(IdentityDetail::allDetails())
    //         ] + $this->commonRegistryParams()
    //     );
    // }

    // public function edit(Request $request, ?Alumnus $alumnus = null)
    // {
    //     $this->authorize('edit', Alumnus::class);

    //     if ($alumnus)
    //         $alumnus->load(['details', 'ratifications', 'ratifications.document']);

    //     return Inertia::render('Registry/Edit', [
    //         'alumnus' => $alumnus,
    //         'noRatStatus' => Alumnus::availableStatus($alumnus),
    //         'allStatus' => Alumnus::status,
    //         'allTags' => Alumnus::allTags(),
    //         'allDetails' => IdentityDetail::allDetails(),
    //         'pendingRats' => $alumnus->pending_ratifications_list,
    //     ]);
    // }

}
