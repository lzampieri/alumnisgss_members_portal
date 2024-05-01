<?php

namespace App\Http\Controllers;

use App\Models\External;
use App\Models\LoginMethod;
use Illuminate\Http\Request;

class ExternalController extends Controller
{

    public function add_and_associate_post(Request $request, LoginMethod $lmth)
    {
        $this->authorize('edit', Alumnus::class);
        $this->authorize('associate', LoginMethod::class);

        // External creation

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'notes' => '',
        ]);

        $external = External::create($validated);

        // Association
        $lmth->identity()->associate($external)->save();

        // TODO LOG THIS THING!
        $external->givePermissionTo('login');

        return redirect()->route('accesses')->with(['notistack' => ['success', 'Utente creato ed abilitato']]);
    }
}
