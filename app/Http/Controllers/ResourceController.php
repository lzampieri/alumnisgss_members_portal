<?php

namespace App\Http\Controllers;

use App\Models\ResourcesSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResourceController extends Controller
{
    public function list()
    {
        $params = [];

        $params['sections'] = ResourcesSection::all();

        return Inertia::render( 'Resources/Main', $params );
    }

}
