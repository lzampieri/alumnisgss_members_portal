<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Policies\DocumentPolicy;
use DateTimeImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DocumentsController extends Controller
{
    public function list()
    {
        $params = [];

        $privacies = DocumentPolicy::visiblePrivacies();
        $params['documents'] = Document::whereIn( 'privacy', $privacies )->get();

        $params['total'] = Document::count();

        $params['canUpload'] = Auth::check() && Auth::user()->can('create', Document::class);
        $params['canEdit'] = Auth::check() && Auth::user()->can('edit', Document::class);

        return Inertia::render('Board/List', $params);
    }

    public function add()
    {
        $this->authorize( 'create', Document::class );

        $canEdit = Auth::check() && Auth::user()->can('edit', Document::class);

        return Inertia::render('Board/Upload', [ 'privacies' => Document::$privacies, 'canEdit' => $canEdit ] );
    }

    public function add_post(Request $request) {
        $this->authorize( 'create', Document::class );

        $validated = $request->validate([
            'title' => 'required|min:3',
            'privacy' => 'required|in:' . implode(',', Document::$privacies),
            'identifier' => 'required|unique:documents,identifier',
            'date' => 'required|date|before_or_equal:now',
            'file' => 'required|mimes:pdf'
        ]);

        $validated['author_id'] = Auth::user()->id;
        $validated['handle'] = 'None';

        $document = Document::create( $validated );
        Log::debug('Document created',$validated);
        
        $months = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
        $date = new DateTimeImmutable( $validated['date'] );
        $handle = $date->format("Y") . $months[ $date->format("n") ] . str_pad( $document->id, 6, '0', STR_PAD_LEFT );
        
        $validated['file']->storeAs( 'documents', $handle . '.pdf' );
        Log::debug('File uploaded',$handle . '.pdf');

        $document->handle = $handle;
        $document->save();
    }
}
