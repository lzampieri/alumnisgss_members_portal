<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NetworkController extends Controller
{
    public function list()
    {
        $this->authorize('viewNetwork', Alumnus::class);

        $prefilt = Alumnus::whereIn('status', Alumnus::public_status);

        if (Auth::check() && Auth::user()->can('viewAny', Alumnus::class)) {
            $prefilt = Alumnus::where('coorte', '>', 0);
        }

        $alumni = $prefilt->where('coorte', '>', 0)
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get();

        $alumni->load('emails');
        $alumni->load('emails.identity');

        foreach ($alumni as $alumnus) {
            if (Auth::user()->can('viewNetworkDetails', $alumnus)) {
                $alumnus->load(['aDetails' => function ($query) {
                    $query->whereHas('aDetailsType', function ($query) {
                        $query->where('visible', true);
                    })->orderBy(ADetailsType::select('order')->whereColumn('a_details_types.id', 'a_details.a_details_type_id'));
                }, 'aDetails.aDetailsType']);
                $alumnus['filtered_details'] = $alumnus->aDetails;
            } else {
                $alumnus['filtered_details'] = [];
            }
            
            $alumnus['visible_emails'] = $alumnus->emails->filter->canView;
        }

        $alumni->append('can_be_network_edited');

        $alumni_cleaned = $alumni->map->only([
            'id',
            'name',
            'surname',
            'coorte',
            'status',

            'filtered_details',
            'visible_emails',

            'can_be_network_edited',
            'consent_to_email_share',
            'consent_to_network_share',
        ]);

        return Inertia::render('Network/List', [
            'alumni' => $alumni_cleaned,
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

        if ($validated['id'] && ADetailsType::find($validated['id'])) {
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

        if ($validated['id'] && ADetailsType::find($validated['id'])) {
            $adt = ADetailsType::find($validated['id']);
            $adt->delete();
            return redirect()->back()->with(['notistack' => ['success', 'Eliminato']]);
        }

        return redirect()->back()->with(['notistack' => ['error', 'Qualcosa è andato storto']]);
    }

    public function edit(Request $request, Alumnus $alumnus)
    {
        $this->authorize('editNetworkAlumnus', $alumnus);

        $adtlist = ADetailsType::allOrdered();
        $adtlist->load(['aDetails' => function ($query) use ($alumnus) {
            $query->where('identity_type', Alumnus::class)->where('identity_id', $alumnus->id);
        }]);
        $adtlist->append('usedValues');

        $alumnus['visible_emails'] = $alumnus->emails->filter->canView;
        $cleaned_alumnus = $alumnus->only([
            'id',
            'name',
            'surname',
            'coorte',
            'status',

            'visible_emails',

            'can_be_network_edited',
            'consent_to_email_share',
            'consent_to_network_share',
        ]);

        return Inertia::render('Network/Edit', [
            'alumnus' => $cleaned_alumnus,
            'adts' => $adtlist
        ]);
    }


    public function edit_post(Request $request, Alumnus $alumnus)
    {
        $this->authorize('editNetworkAlumnus', $alumnus);

        $validated = $request->validate([
            'adts' => 'array',
            'adts.*' => 'array',
            'adts.*.id' => 'required|distinct|exists:a_details_types,id',
            'adts.*.value' => 'nullable|array',
        ]);

        foreach ($validated['adts'] as $adts) {
            if ((count($adts['value']) == 1) && is_array($adts['value'][0])) // Extra check to prevent array of array
                $adts['value'] = $adts['value'][0];

            $alumnus->aDetails()->updateOrCreate(
                ['a_details_type_id' => $adts['id']],
                ['value' => $adts['value']]
            );
        }

        return redirect()->back()->with(['notistack' => ['success', 'Salvato!']]);
    }
}
