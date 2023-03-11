<?php

namespace App\Http\Controllers;

use App\Models\ResourcesSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResourceController extends Controller
{
    public function list( ResourcesSection $section = null )
    {
        $params = [];

        $params['sections'] = ResourcesSection::all();

        if( $section ) {
            $params['section'] = $section;
        }

        return Inertia::render( 'Resources/Main', $params );
    }

}
