<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\Email;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function myself()
    {
        $this->authorize('viewHimself', Alumnus::class);

        $alumnus = Auth::user()->identity;

        if (!$alumnus)
            return abort(404);

        $alumnus->load(['ratifications', 'ratifications.document', 'emails', 'roles']);

        $adtlist = ADetailsType::allOrdered();
        $adtlist->load(['aDetails' => function ($query) use ($alumnus) {
            $query->where('identity_type', Alumnus::class)->where('identity_id', $alumnus->id);
        }]);
        
        return Inertia::render(
            'Profile/Myself',
            [
                'alumnus' => $alumnus,
                'adts' => $adtlist
            ]
        );
    }

    public function dataConsent()
    {
        $this->authorize('viewHimself', Alumnus::class);

        $alumnus = Auth::user()->identity;

        if (!$alumnus)
            return abort(404);
        
        return Inertia::render(
            'Profile/DataConsent',
            [
                'alumnus' => $alumnus,
            ]
        );
    }

    public function dataConsent_post()
    {
        $this->authorize('viewHimself', Alumnus::class);

        $alumnus = Auth::user()->identity;

        if (!$alumnus)
            return abort(404);

        $alumnus->consent_to_network_share = !$alumnus->consent_to_network_share;
        $alumnus->save();

        return redirect()->route('profile')->with(['notistack' => ['success', 'Salvato!']]);
    }
    
    function addEmail_post(Request $request)
    {
        $this->authorize('viewHimself', Alumnus::class);
        
        $validated = $request->validate([
            'address' => 'required|email|unique:emails,address'
        ]);

        $em = Email::create([
            'address' => $validated['address'],
            'comment' => "Aggiunto dall'utente"
        ]);

        $em->identity()->associate( Auth::user()->identity )->save();

        return redirect()->back()->with(['notistack' => ['success', 'Aggiunto']]);
    }

    function setPrimary_post(Request $request)
    {
        $this->authorize('viewHimself', Alumnus::class);
        
        $validated = $request->validate([
            'id' => 'required|numeric',
        ]);
        
        $e = Email::find($validated['id']);
        
        if( !$e )
            return redirect()->back()->with(['notistack' => ['error', 'Indirizzo non trovato']]);

        if( !$e->identity->is(Auth::user()->identity))
            return redirect()->back()->with(['notistack' => ['error', 'Indirizzo non riconosciuto']]);
        
        $e->primary = max( $e->identity->emails()->pluck('emails.primary')->toArray() ) + 1;
        $e->save();
        return redirect()->back()->with(['notistack' => ['success', 'Precedenza impostata']]);
    }
    
    public function edit()
    {
        $this->authorize('viewHimself', Alumnus::class);

        $alumnus = Auth::user()->identity;

        if (!$alumnus)
            return abort(404);

        $adtlist = ADetailsType::allOrdered();
        $adtlist->load(['aDetails' => function ($query) use ($alumnus) {
            $query->where('identity_type', Alumnus::class)->where('identity_id', $alumnus->id);
        }]);
        $adtlist->append('usedValues');

        return Inertia::render('Profile/Edit', [
            'alumnus' => $alumnus,
            'adts' => $adtlist
        ]);
    }


    public function edit_post(Request $request)
    {
        $this->authorize('viewHimself', Alumnus::class);

        $alumnus = Auth::user()->identity;

        if (!$alumnus)
            return abort(404);

        $validated = $request->validate([
            'adts' => 'array',
            'adts.*' => 'array',
            'adts.*.id' => 'required|distinct|exists:a_details_types,id',
            'adts.*.value' => 'nullable|array',
        ]);

        foreach ($validated['adts'] as $adts) {
            if( ( count( $adts['value'] ) == 1 ) && is_array( $adts['value'][0] ) ) // Extra check to prevent array of array
                $adts['value'] = $adts['value'][0];

            $alumnus->aDetails()->updateOrCreate(
                ['a_details_type_id' => $adts['id']],
                ['value' => $adts['value']]
            );
        }

        return redirect()->route('profile')->with(['notistack' => ['success', 'Salvato!']]);
    }

}
