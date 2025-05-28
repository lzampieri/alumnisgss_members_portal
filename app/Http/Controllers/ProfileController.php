<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
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

        $alumnus->load(['ratifications', 'ratifications.document', 'loginMethods', 'roles']);

        return Inertia::render(
            'Profile/Myself',
            [
                'alumnus' => $alumnus,
            ]
        );
    }
}
