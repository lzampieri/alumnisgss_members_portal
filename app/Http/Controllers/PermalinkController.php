<?php

namespace App\Http\Controllers;

use App\Models\Permalink;
use App\Models\Resource;

class PermalinkController extends Controller
{
    public function view(Permalink $permalink)
    {
        $toView = $permalink->linkable;

        if ($toView instanceof Resource)
            return (new ResourceController)->list($toView);

        return response(['error' => true, 'error-msg' => 'Permalink not found'], 404);
    }
}
