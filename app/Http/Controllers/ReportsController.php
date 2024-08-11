<?php

namespace App\Http\Controllers;

use App\Models\Ratification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function home()
    {
        // Todo add proper authorization

        $options = [
            ['name' => 'Ratifiche in attesa', 'url' => route('ratifications.export'), 'inertia' => FALSE, 'enabled' => Auth::user()->can('view', Ratification::class)],
            ['name' => 'Members', 'url' => route('members')],
            ['name' => 'Documents', 'url' => route('members')],
        ];

        $feasible_options = array_values(array_filter($options, function ($opt) {
            return array_key_exists('enabled', $opt) && $opt['enabled'];
        }));

        return Inertia::render('Reports/Home', ['options' => $feasible_options]);
    }
}
