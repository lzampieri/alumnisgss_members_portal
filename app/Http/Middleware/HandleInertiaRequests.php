<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        $data = parent::share($request);

        if( Auth::check() ) {
            $data = array_merge( $data, [ 'user' => Auth::user()->load('identity') ] );
        }
        
        if( session()->has( 'notistack' ) ) {
            $data = array_merge( $data, [ 'notistack' => session('notistack') ] );
        }

        if( session()->has( 'errorsDialogs' ) ) {
            $data = array_merge( $data, [ 'errorsDialogs' => session('errorsDialogs') ] );
        }

        if( session()->has( 'inertiaFlash' ) ) {
            $data = array_merge( $data, [ 'flash' => session('inertiaFlash') ] );
        }
        
        return $data;
    }
}
