<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Ratification;
use App\Policies\DocumentPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use setasign\Fpdi\Tcpdf\Fpdi;
use Inertia\Inertia;

class DocumentsController extends Controller
{
    public function list()
    {
        $params = [];

        $privacies = DocumentPolicy::visiblePrivacies();
        $params['documents'] = Document::whereIn('privacy', $privacies)->with('author')->orderBy('date', 'desc')->orderBy('handle', 'desc')->get();

        $params['total'] = Document::count();

        $params['canUpload'] = Auth::check() && Auth::user()->can('create', Document::class);
        $params['canEdit'] = Auth::check() && Auth::user()->can('edit', Document::class);

        return Inertia::render('Board/List', $params);
    }

    public function add()
    {
        $this->authorize('create', Document::class);

        $canEdit = Auth::check() && Auth::user()->can('edit', Document::class);

        return Inertia::render('Board/Upload', [
            'privacies' => Document::$privacies, 'canEdit' => $canEdit,
            'open_rats' => Ratification::whereNull('document_id')->with('alumnus')->get()
                            ->sortBy( function( $rat, $key ) { return str_pad( $rat->alumnus->coorte, 4, 0, STR_PAD_LEFT ) . " " . $rat->alumnus->surname . " " . $rat->alumnus->name; } )
                            ->groupBy('required_state'),
        ]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('create', Document::class);

        $validated = $request->validate([
            'privacy' => 'required|in:' . implode(',', Document::$privacies),
            'identifier' => 'required|unique:documents,identifier',
            'date' => 'required|date|before_or_equal:now',
            'prehandle' => 'required|min:5|max:5',
            'note' => '',
            'ratifications' => 'array',
            'ratifications.*' => 'integer|exists:ratifications,id',
            'file' => 'required|mimes:pdf',
        ]);

        $validated['author_type'] = Auth::user()->identity_type;
        $validated['author_id'] = Auth::user()->identity_id;
        $validated['handle'] = 'None';

        $document = Document::create($validated);
        Log::debug('Document created', $validated);

        $handle = $validated['prehandle'] . str_pad($document->id, 6, '0', STR_PAD_LEFT);

        $validated['file']->storeAs('documents', $handle . '.pdf');
        Log::debug('File uploaded', $handle . '.pdf');

        $document->handle = $handle;
        $document->save();

        if( array_key_exists( 'ratifications', $validated ) )
            foreach( $validated['ratifications'] as $rat ) {
                $ratification = Ratification::find( $rat );
                $ratification->document()->associate( $document )->save();
                $alumnus = $ratification->alumnus;
                $alumnus->status = $ratification->required_state;
                $alumnus->save();
                Log::debug('Ratification approved',['ratification'=>$ratification,'document'=>$document]);
            }

        return redirect()->route('board')->with(['notistack' => ['success', 'File caricato con protocollo ' . $handle]]);
    }

    public function edit(Document $document)
    {
        $this->authorize('edit', Document::class);

        $document->grouped_ratifications = $document->ratifications->load('alumnus')->groupBy('required_state');

        return Inertia::render('Board/Edit', ['document' => $document, 'privacies' => Document::$privacies]);
    }
   
    public function edit_post(Request $request, Document $document)
    {
        $this->authorize('edit', Document::class);

        $validated = $request->validate([
            'privacy' => 'required|in:' . implode(',', Document::$privacies),
            'date' => 'required|date|before_or_equal:now',
            'note' => ''
        ]);

        $document->update($validated);
        Log::debug('Document updated', $validated);

        return redirect()->route('board')->with(['notistack' => ['success', 'Dati aggiornati']]);
    }
 
    public function delete_post(Request $request, Document $document)
    {
        $this->authorize('edit', Document::class);

        foreach( $document->ratifications as $rat ) {
            Log::debug('Ratification cancelled', $rat);
            $rat->document()->associate(null)->save();
        }

        Log::debug('Document deleted', $document);

        $document->delete();

        return redirect()->route('board')->with(['notistack' => ['success', 'Eliminato']]);
    }

    public function view(Document $document)
    {
        $this->authorize('view', $document);

        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile(storage_path() . '/app/documents/' . $document->handle . '.pdf');

        
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        $pdf->SetAutoPageBreak(false);
        $pdf->SetFont('Helvetica');
        $pdf->SetFontSize('10');
        $pdf->SetTextColor(255, 0, 0);

        $footer = '=== Scaricato dal portale soci il ' . date('d/m/Y') . ' - Protocollo web ' . $document->handle . ' ===';

        for ($i = 1; $i <= $pageCount; $i++) {
            $id = $pdf->importPage($i);

            // Add a page
            $pdf->AddPage();
            $pdf->useTemplate($id, 0, 0, null, null, true);

            // Add watermark on the bottom
            $pdf->SetXY(0, -10);
            $pdf->Cell(0, 7, $footer, 0, 0, 'C');
        }
        $pdf->SetTitle($document->identifier);

        Log::debug('File generated', ['handle' => $document->handle]);

        $pdf->Output($document->handle . '.pdf', 'I');
        exit;
    }
}
