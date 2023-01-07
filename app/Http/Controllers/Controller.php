<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;

class Controller extends BaseController
{
    use DispatchesJobs, ValidatesRequests;

    use AuthorizesRequests { authorize as traitAuthorize; }

    public function authorize($ability, $arguments = null )
    {
        // Prevent the direct call of authorize without passing through a policy

        if( $arguments == null ) {
            if( Auth::user() && Auth::user()->hasPermissionTo( $ability ) )
                return true;

            return abort(403,'THIS ACTION IS UNAUTHORIZED.');
        }

        return $this->traitAuthorize( $ability, $arguments );
    }
}
