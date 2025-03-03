<?php

namespace App\Http\Controllers;

use App\Models\ADetail;
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

class AlumnusControllerChecks extends Controller
{

    public function checks()
    {
        $this->authorize('viewAny', Alumnus::class);
        $this->authorize('edit', Alumnus::class);
        
        $alumnusData = Alumnus::with(['aDetails' => function ($query) {
                $query->whereHas('aDetailsType', function ($query) {
                    $query->where('visible', true);
                })->orderBy(ADetailsType::select('order')->whereColumn('a_details_types.id', 'a_details.a_details_type_id'));
            }, 'aDetails.aDetailsType'])
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->append('a_details_keyd')
            ->toArray();

        array_walk($alumnusData, function (&$alumnus,$key) {

            // Remove irrelevant data
            unset( $alumnus['enabled'] );
            unset( $alumnus['a_details'] );
            unset( $alumnus['permissions'] );
            unset( $alumnus['roles'] );

            // Remove details but keep the count
            array_walk($alumnus['a_details_keyd'], function (&$det,$key) {
                $det = count($det["value"]);
            });
        });

        $adtlist = ADetailsType::allOrdered()->keyBy('id');

        $oldDetails = IdentityDetail::allDetails();

        $doubledDetails = ADetail::with('identity','aDetailsType')->get()->filter(function ($detail) {
            return count($detail->value) != count(array_unique($detail->value));
        })->values();

        $wrongSelect = ADetail::whereHas('aDetailsType', function ($query) {
            $query->where('type', 'select'); })->with('identity')->get()->filter(function ($detail) {
                return count( $detail->value ) > 0 && !in_array( $detail->value[0], explode( ';', $detail->aDetailsType->param ) );
            })->values();
            
        return Inertia::render(
            'Registry/Checks',
            [
                'alumnusData' => $alumnusData,
                'adtlist' => $adtlist,
                'oldDetails' => $oldDetails,
                'doubledDetails' => $doubledDetails,
                'wrongSelect' => $wrongSelect
            ]
        );
    }

    public function assdet(Request $request)
    {
        $this->authorize('edit', Alumnus::class);
        $validated = $request->validate([
            'from' => 'required|exists:identity_details,key',
            'to' => 'required|exists:a_details_types,id',
        ]);

        $oldDetails = IdentityDetail::where('key',$validated['from'])->get();
        $newDetType = ADetailsType::find($validated['to']);

        foreach ($oldDetails as $oldDetail) {
            // return response()->json(['a_details_type_id' => $newDetType->id, 'identity_type' => $oldDetail->identity_type, 'identity_id' => $oldDetail->identity_id]);
            $newDet = ADetail::firstOrCreate(
                ['a_details_type_id' => $newDetType->id, 'identity_type' => $oldDetail->identity_type, 'identity_id' => $oldDetail->identity_id],
                ['value' => []]
            );

            $newValue = $newDet->value;
            $newValue[] = $oldDetail->value;

            // Special behaviour for arrayable
            if ( $newDetType->type == 'arrayable') {
                $newValueSeparated = [];
                foreach ($newValue as $v) {
                    foreach (preg_split("/[" . preg_quote($newDetType->param, '/') . "]/", $v, -1, PREG_SPLIT_NO_EMPTY) as $vv)
                        $newValueSeparated[] = $vv;
                }
                $newValue = $newValueSeparated;
            }

            $newDet->value = $newValue;
            $newDet->save();

            $oldDetail->delete();
        }

        return redirect()->back();
    }

    public function dupcor(Request $request)
    {
        $this->authorize('edit', Alumnus::class);

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
