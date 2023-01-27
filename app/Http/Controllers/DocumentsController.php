<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\File;
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
        $params['documents'] = Document::whereIn('privacy', $privacies)->with('author')->orderBy('date', 'desc')->orderBy('protocol', 'desc')->get();

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
        $validated['protocol'] = $validated['prehandle'];

        // Create the document
        $document = Document::create($validated);
        Log::debug('Document created', $validated);

        // Create the protocol
        $protocol = $validated['prehandle'] . str_pad($document->id, 6, '0', STR_PAD_LEFT);
        $document->protocol = $protocol;
        $document->save();
        Log::debug('Protocol assigned', $validated);

        // Save the file
        $file = File::create();
        $file->handle =  'file_' . $file->id . '.pdf';
        $file->parent()->associate( $document )->save();
        $file->save();
        $validated['file']->storeAs('files', $file->handle );
        Log::debug('File uploaded', $file );

        // Validate ratifications
        if( array_key_exists( 'ratifications', $validated ) )
            foreach( $validated['ratifications'] as $rat ) {
                $ratification = Ratification::find( $rat );
                $ratification->document()->associate( $document )->save();
                $alumnus = $ratification->alumnus;
                $alumnus->status = $ratification->required_state;
                $alumnus->save();
                Log::debug('Ratification approved',['ratification'=>$ratification,'document'=>$document]);
            }

        return redirect()->route('board')->with(['notistack' => ['success', 'Documento caricato con protocollo ' . $protocol]]);
    }

    public function edit(Document $document)
    {
        $this->authorize('edit', Document::class);

        $document->grouped_ratifications = $document->ratifications->load('alumnus')->groupBy('required_state');
        $document->load('files');

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

    public function new_version(Document $document)
    {
        $this->authorize('edit', Document::class);
        return Inertia::render('Board/NewVersion', ['document' => $document]);
    }
 
    public function new_version_post(Request $request, Document $document)
    {
        $this->authorize('edit', Document::class);

        $validated = $request->validate([
            'file' => 'required|mimes:pdf',
        ]);

        // Save the file
        $file = File::create();
        $file->handle =  'file_' . $file->id . '.pdf';
        $file->parent()->associate( $document )->save();
        $file->save();
        $validated['file']->storeAs('files', $file->handle );
        Log::debug('New version for document uploaded', ['file' => $file, 'document' => $document ] );

        return redirect()->route('board.edit', [ 'document' => $document->id ] )->with(['notistack' => ['success', 'Nuova versione caricata']]);
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

    public function view_document($protocol) {
        $document = Document::where('protocol', $protocol)->first();
        if( !$document )
            return redirect()->back()->with('notistack',['error','Documento non trovato']);

        $this->authorize('view', $document);
        return $this->view_file( $document->files()->latest()->first() );
    }

    public function view_file(File $file)
    {
        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile(storage_path() . '/app/files/' . $file->handle);

        $all_versions = $file->parent->files()->latest()->first()->pluck('id')->toArray();
        $this_version = array_search( $file->id, $all_versions ) + 1;
        $latest = $this_version == count( $all_versions );
        
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        $pdf->SetAutoPageBreak(false);
        $pdf->SetFont('Helvetica');
        $pdf->SetFontSize('10');
        $pdf->SetTextColor(255, 0, 0);

        $header = '=== VERSIONE OBSOLETA! Una nuova versione del documento è presente sul portale ===';
        $footer = '=== Scaricato dal portale soci il ' . date('d/m/Y') . ' - Protocollo web ' . $file->parent->protocol . ' - Versione ' . $this_version . ' di ' . count( $all_versions ) . ' ===';

        for ($i = 1; $i <= $pageCount; $i++) {
            $id = $pdf->importPage($i);

            // Add a page
            $pdf->AddPage();
            $pdf->useTemplate($id, 0, 0, null, null, true);

            // Add watermark on the bottom
            $pdf->SetXY(0, -10);
            $pdf->Cell(0, 7, $footer, 0, 0, 'C');

            // Add watermark on the top for obsolete
            if( !$latest ) {
                $pdf->SetXY(0, 10);
                $pdf->Cell(0, 7, $header, 0, 0, 'C');
            }
        }
        $pdf->SetTitle($file->parent->identifier);

        Log::debug('File generated', ['file' => $file->handle, 'document' => $file->parent->protocol]);

        $pdf->Output($file->parent->protocol . '.pdf', 'I');
        exit;
    }
}
