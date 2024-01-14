<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function fromHandle(string $handle)
    {
        $file = File::where('handle',$handle)->firstOrFail();

        $this->authorize( 'view', $file );

        return response()->file( storage_path() . '/app/files/' . $file->handle );
    }
}
