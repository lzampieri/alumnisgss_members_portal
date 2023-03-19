<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use Inertia\Inertia;

class ResourceController extends Controller
{
    public function list( Resource $resource = null )
    {
        $params = [];

        $params['resources'] = Resource::all()->filter->canView;
        $params['hidden'] = Resource::count() - $params['resources']->count();

        if( $resource ) {
            $params['resource'] = $resource->append(['canView','canEdit'])
                ->load(['dynamicPermissions','dynamicPermissions.role','blocks']);
        }

        return Inertia::render( 'Resources/Main', $params );
    }

}
