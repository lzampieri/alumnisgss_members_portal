<?php

namespace App\Http\Controllers;

use App\Models\Ratification;
use Inertia\Inertia;

class RatificationController extends Controller
{
    public function list()
    {
        $this->authorize('view', Ratification::class);

        return Inertia::render('Ratifications/List', []);
    }

}
