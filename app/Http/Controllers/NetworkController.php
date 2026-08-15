<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NetworkController extends Controller
{
    public function list()
    {
        $this->authorize('viewNetworkPage', Person::class);

        $prefilt = Person::where('coorte', '>', 0)->whereIn('status', Alumnus::public_status);

        if (Auth::check() && Auth::user()->can('viewAnyAlumnus', Person::class)) {
            $prefilt = Person::where('coorte', '>', 0);
        }

        $alumni = $prefilt->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get();

        foreach ($alumni as $alumnus) {
            if (Auth::check() && Auth::user()->can('viewDetails', $alumnus)) {
                $alumnus->load(['aDetails' => function ($query) {
                    $query->whereHas('aDetailsType', function ($query) {
                        $query->where('visible', true);
                    })->orderBy(ADetailsType::select('order')->whereColumn('a_details_types.id', 'a_details.a_details_type_id'));
                }, 'aDetails.aDetailsType']);
                $alumnus['filtered_details'] = $alumnus->aDetails;
            } else {
                $alumnus['filtered_details'] = [];
            }
        }

        $alumni->append('can_details_be_edited');

        $alumni_cleaned = $alumni->map->only([
            'id',
            'name',
            'surname',
            'coorte',
            'status',

            'filtered_details',

            'can_details_be_edited',
            'consent_to_network_share',
        ]);

        return Inertia::render('Network/List', [
            'alumni' => $alumni_cleaned,
            'canEditView' => Auth::user()->can('editNetworkView', Person::class)
        ]);
    }

    public function view(Request $request, Person $alumnus)
    {
        $this->authorize('viewGeneral', $alumnus);

        $itsme = (Auth::user()->is($alumnus));

        if (Auth::user()->can('viewDetails', $alumnus)) {
            $alumnus->load(['aDetails' => function ($query) {
                $query->whereHas('aDetailsType', function ($query) {
                    $query->where('visible', true);
                })->orderBy(ADetailsType::select('order')->whereColumn('a_details_types.id', 'a_details.a_details_type_id'));
            }, 'aDetails.aDetailsType']);
            $alumnus['filtered_details'] = $alumnus->aDetails;
        } else {
            $alumnus['filtered_details'] = [];
        }

        $alumnus->load('emails');
        $alumnus->load('emails.identity');
        $alumnus->append('visible_emails');

        $alumnus->append('can_details_be_edited');

        $alumnus = $alumnus->only([
            'id',
            'name',
            'surname',
            'coorte',
            'status',

            'filtered_details',
            'visible_emails',

            'can_details_be_edited',
            'consent_to_email_share',
            'consent_to_network_share',
        ]);

        return Inertia::render('Network/View', [
            'alumnus' => $alumnus,
            'itsme' => $itsme
        ]);
    }


    public function settings()
    {
        $this->authorize('editNetworkView', Person::class);

        return Inertia::render('Network/Settings', [
            'aDetailsTypes' => ADetailsType::allOrdered()
        ]);
    }

    public function adtedit(Request $request)
    {
        $this->authorize('editNetworkView', Person::class);
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
        $this->authorize('editNetworkView', Person::class);

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
}
