<?php

namespace App\Http\Controllers;

use App\Models\ADetail;
use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\Person;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlumnusControllerChecks extends Controller
{

    public function checks()
    {
        $this->authorize('viewAllDetails', Person::class);
        $this->authorize('editDetails', Person::class);
        
        $alumnusData = Person::where('coorte', '>', 0)
            ->with(['aDetails' => function ($query) {
                $query->whereHas('aDetailsType', function ($query) {
                    $query->where('visible', true);
                })->orderBy(ADetailsType::select('order')->whereColumn('a_details_types.id', 'a_details.a_details_type_id'));
            }, 'aDetails.aDetailsType'])
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->append('a_details_keyd')
            ->makeVisible('a_details_keyd')
            ->makeHidden(['enabled', 'a_details', 'permissions', 'roles'])
            ->toArray();

        array_walk($alumnusData, function (&$alumnus,$key) {
            // Remove details but keep the count
            array_walk($alumnus['a_details_keyd'], function (&$det,$key) {
                $det = count($det["value"]);
            });
        });

        $adtlist = ADetailsType::allOrdered()->keyBy('id');

        $doubledDetails = ADetail::with(['identity','aDetailsType'])->get()->filter(function ($detail) {
            return count($detail->value) != count(array_unique($detail->value));
        })->values();

        $wrongSelect = ADetail::whereHas('aDetailsType', function ($query) {
            $query->where('type', 'select'); })->with('identity')->get()->filter(function ($detail) {
                return count( $detail->value ) > 0 && !in_array( $detail->value[0], explode( ';', $detail->aDetailsType->param ) );
            })->values();
            
        return Inertia::render(
            'Members/Checks',
            [
                'alumnusData' => $alumnusData,
                'adtlist' => $adtlist,
                'doubledDetails' => $doubledDetails,
                'wrongSelect' => $wrongSelect
            ]
        );
    }

    public function dupcor(Request $request)
    {
        $this->authorize('viewAllDetails', Person::class);
        $this->authorize('editDetails', Person::class);

        $validated = $request->validate([
            'selected' => 'array',
            'selected.*' => 'exists:a_details,id'
        ]);

        foreach ($validated['selected'] as $id) {
            $adt = ADetail::findOrFail($id);
            $adt->value = array_values( array_unique($adt->value) );
            $adt->save();
        }

        return redirect()->back();
    }

}
