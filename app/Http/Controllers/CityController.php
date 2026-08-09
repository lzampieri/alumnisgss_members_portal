<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Geocoder\Geocoder;

const CITY_ADT_NAME = 'Città attuale';

class CityController extends Controller
{
    private function generate_citites()
    {
        $adt = ADetailsType::where('name', CITY_ADT_NAME)->first();

        if (!$adt)
            return;

        $values = array_map(function ($v) {
            return $v[0];
        }, array_filter($adt->used_values, function ($v) {
            return count($v) > 0;
        }));

        $values_toparse = array_diff($values, City::all()->pluck('name')->toArray());

        if (count($values_toparse) > 0) {
            $client = new \GuzzleHttp\Client();
            $geocoder = new Geocoder($client);
            $geocoder->setApiKey(env('GEOCODING_API_KEY', ''));
            $geocoder->setLanguage('it');

            foreach ($values_toparse as $value) {
                $location = $geocoder->getCoordinatesForAddress($value);

                City::create([
                    'name' => $value,
                    'display_name' => $location['formatted_address'],
                    'lat' => $location['lat'],
                    'lng' => $location['lng']
                ]);
            }
        }
    }

    public function verify_cities()
    {
        $this->authorize('viewAll', City::class);

        return Inertia::render(
            'Webmaster/VerifyCities',
            ['cities' => City::all()]
        );
    }

    public function delete_city(Request $request)
    {
        $this->authorize('edit', City::class);

        $id = $request->input('id', -1);
        $city = City::find($id);

        if ($city) {
            $city->delete();
            return redirect()->back()->with(['notistack' => ['success', 'Città eliminata']]);
        }

        return redirect()->back()->with(['notistack' => ['error', 'C\'è stato un errore']]);
    }

    public function renegerate_cities(Request $request)
    {
        $this->authorize('edit', City::class);

        $this->generate_citites();

        return redirect()->back()->with(['notistack' => ['success', 'Città ricaricate']]);
    }

    public function map(Request $request)
    {
        $this->authorize('viewAll', City::class);

        $this->generate_citites();

        $cities = City::all();
        $cities_array = $cities->groupBy('display_name')->toArray();
        $cities_dict = $cities->pluck('display_name', 'name')->toArray();

        foreach ($cities_array as &$ct) {
            $ct['alumni'] = [];
        }

        $all_dets = ADetailsType::where('name', CITY_ADT_NAME)->with('aDetails', 'aDetails.identity')->first();

        foreach ($all_dets['aDetails'] as $adt) {
            if (!$adt->identity)
                continue;

            if (!in_array($adt->identity->status, Alumnus::public_status))
                continue;

            if (count($adt->value) == 0)
                continue;

            if (Auth::user()->can('viewDetails', $adt->identity))
                $cities_array[$cities_dict[$adt->value[0]]]['alumni'][] = $adt->identity;
            else
                $cities_array[$cities_dict[$adt->value[0]]]['alumni'][] = ['id' => -1];
        }

        $cities_array = array_filter($cities_array, function ($v) {
            return count($v['alumni']) > 0;
        });

        return Inertia::render(
            'Network/Map',
            ['cities' => $cities_array]
        );
    }
}
