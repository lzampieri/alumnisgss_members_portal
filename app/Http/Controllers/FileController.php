<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function fromHandle(string $handle)
    {
        $file = File::where('handle', $handle)->firstOrFail();

        $this->authorize('view', $file);

        return response()->file($file->path());
    }

    public function fromId(File $id)
    {
        $this->authorize('view', $id);

        return response()->file($id->path());
    }
}
