<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\ADetail;
use App\Models\ADetailType;
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
            ->with(['aDetails','aDetails.aDetailsType'])
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
            'aDetailsTypes' => ADetailsType::allOrdered()
        ]);
    }

    public function adtedit(Request $request)
    {
        $this->authorize('editNetworkView', Alumnus::class);
        $update = false;
        
        $validated = $request->validate([
            'id' => 'numeric',
            'name' => 'required|regex:/^[A-zÀ-ú\d\s\'_:,]+$/',
            'type' => 'required|alpha_num',
            'param' => 'nullable',
            'order' => 'required|numeric',
            'visible' => 'required|boolean',
        ]);
        
        if( $validated['id'] && ADetailsType::find($validated['id']) ) {
            $update = true;

            $adt = ADetailsType::find($validated['id']);
            $adt->name = $validated['name'];
            $adt->type = $validated['type'];
            $adt->param = array_key_exists('param', $validated) ? $validated['param'] : '';
            $adt->order = $validated['order'];
            $adt->visible = $validated['visible'];
            $adt->save();
        } else {
            ADetailsType::create($validated);
        }

        return redirect()->back()->with(['notistack' => ['success', $update ? 'Modificato' : 'Inserito']]);
    }

    public function adtdelete(Request $request)
    {
        $this->authorize('editNetworkView', Alumnus::class);

        $validated = $request->validate([
            'id' => 'required|numeric',
        ]);

        if( $validated['id'] && ADetailsType::find($validated['id']) ) {
            $adt = ADetailsType::find($validated['id']);
            $adt->delete();
            return redirect()->back()->with(['notistack' => ['success', 'Eliminato']]);
        }

        return redirect()->back()->with(['notistack' => ['error', 'Qualcosa è andato storto']]);
    }

    public function edit(Request $request, Alumnus $alumnus)
    {
        $this->authorize('editNetworkAlumnus', Alumnus::class);

        $adtlist = ADetailsType::visibleOrdered();
        $adtlist->load(['aDetails' => function ($query) use ($alumnus) {
            $query->where('identity_type', Alumnus::class)->where('identity_id', $alumnus->id);
        }]);
        $adtlist->append('usedValues');

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
            'adts.*.id' => 'required|distinct|exists:a_details_types,id',
            'adts.*.value' => 'nullable|array',
        ]);

        foreach ($validated['adts'] as $adts) {
            $alumnus->aDetails()->updateOrCreate(
                [ 'a_details_type_id' => $adts['id'] ],
                [ 'value' => $adts['value'] ]
            );
        }

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
