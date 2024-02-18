<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Document;
use App\Models\DynamicPermission;
use App\Models\File;
use App\Models\Ratification;
use App\Policies\DocumentPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use setasign\Fpdi\Tcpdf\Fpdi;
use Inertia\Inertia;
use PhpOption\None;
use Spatie\Permission\Models\Role;

class DocumentsController extends Controller
{
    public function list()
    {
        $params = [];

        $params['documents'] = Document::whereNull('attached_to_id')
            ->with(['author', 'dynamicPermissions', 'dynamicPermissions.role'])
            ->with(['attachments', 'attachments.author', 'attachments.dynamicPermissions', 'attachments.dynamicPermissions.role'])
            ->orderBy('date', 'desc')->orderBy('protocol', 'desc')->get()
            ->filter->canView->values();
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
            'roles' => Role::where('name', '!=', 'webmaster')->orderBy('id')->get(),
            'canEdit' => $canEdit,
            'open_rats' => Ratification::whereNull('document_id')->with('alumnus')->get()
                ->sortBy(function ($rat, $key) {
                    return str_pad($rat->alumnus->coorte, 4, 0, STR_PAD_LEFT) . " " . $rat->alumnus->surname . " " . $rat->alumnus->name;
                })
                ->groupBy('required_state'),
            'parentable' => Document::whereNull('attached_to_id')->latest()->get()

        ]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('create', Document::class);

        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:now',
            'prehandle' => 'required|min:5|max:5',
            'note' => '',
            'roles' => 'array|min:1',
            'roles.*' => 'integer|exists:roles,id',
            'ratifications' => 'array',
            'ratifications.*' => 'integer|exists:ratifications,id',
            'file' => 'required|mimes:pdf',
            'attached_to_id' => 'integer|exists:documents,id|nullable',
            'identifier' => [
                'required',
                function ($attribute, $value, $fail) use ($request) {
                    $att_to_id = $request->input('attached_to_id');
                    if ($att_to_id) {
                        if (Document::where('identifier', $value)->where('attached_to_id', $att_to_id)->exists())
                            $fail('Esiste già un allegato con lo stesso nome per questo documento');
                    } else {
                        if (Document::where('identifier', $value)->whereNull('attached_to_id')->exists())
                            $fail('Identificativo già registrato');
                    }
                }
            ]
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
        $file->parent()->associate($document)->save();
        $validated['file']->storeAs('files', $file->handle);

        $file->sha256 = $file->computeSha256();
        $file->save();
        Log::debug('File uploaded', $file);

        // Save the visibility
        foreach ($validated['roles'] as $role) {
            $dynamicPermission = DynamicPermission::createFromRelations('view', $document, Role::findById($role));
            Log::debug('Dynamic permission set', $dynamicPermission);
        }

        // Validate ratifications
        if (array_key_exists('ratifications', $validated))
            foreach ($validated['ratifications'] as $rat) {
                $ratification = Ratification::find($rat);
                $ratification->document()->associate($document)->save();
                $alumnus = $ratification->alumnus;
                $alumnus->status = $ratification->required_state;
                $alumnus->save();
                Log::debug('Ratification approved', ['ratification' => $ratification, 'document' => $document]);
            }

        return redirect()->route('board')->with(['notistack' => ['success', 'Documento caricato con protocollo ' . $protocol]]);
    }

    public function edit(Document $document)
    {
        $this->authorize('edit', Document::class);

        $document->grouped_ratifications = $document->ratifications->load('alumnus')->groupBy('required_state');
        $document->load(['files', 'dynamicPermissions', 'attached_to']);

        return Inertia::render('Board/Edit', [
            'document' => $document,
            'roles' => Role::where('name', '!=', 'webmaster')->orderBy('id')->get(),
            'available_ratifications' => Ratification::whereNull('document_id')->with('alumnus')->get()->groupBy('required_state'),
            'available_status' => Alumnus::availableStatus(),
            'parentable' => Document::whereNull('attached_to_id')->where('id', '!=', $document->id)->latest()->get()
        ]);
    }

    public function edit_post(Request $request, Document $document)
    {
        $this->authorize('edit', Document::class);

        $validated = $request->validate([
            'roles' => 'array',
            'roles.*' => 'integer|exists:roles,id',
            'date' => 'required|date|before_or_equal:now',
            'note' => '',
            'attached_to_id' => 'integer|exists:documents,id|nullable',
            'identifier' => [
                'required',
                function ($attribute, $value, $fail) use ($request, $document) {
                    $att_to_id = $request->input('attached_to_id');
                    if ($att_to_id) {
                        if (Document::where('identifier', $value)->where('attached_to_id', $att_to_id)->where('id', '!=', $document->id)->exists())
                            $fail('Esiste già un allegato con lo stesso nome per questo documento');
                    } else {
                        if (Document::where('identifier', $value)->whereNull('attached_to_id')->where('id', '!=', $document->id)->exists())
                            $fail('Identificativo già registrato');
                    }
                }
            ]
        ]);

        $document->update($validated);
        Log::debug('Document updated', ['document_id' => $document->id, 'new_params' => $validated]);

        $current_roles = $document->dynamicPermissions->pluck('role_id')->toArray();
        foreach (array_diff($current_roles, $validated['roles']) as $role) {
            // Roles to remove
            $dynamicPermission = $document->dynamicPermissions()->where('role_id', $role)->get();
            foreach ($dynamicPermission as $dp) {
                Log::debug('Dynamic permission removed', $dp);
                $dp->delete();
            }
        }
        foreach (array_diff($validated['roles'], $current_roles) as $role) {
            // Roles to add
            $dynamicPermission = DynamicPermission::createFromRelations('view', $document, Role::findById($role));
            Log::debug('Dynamic permission set', $dynamicPermission);
        }

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
        $file->parent()->associate($document)->save();

        $validated['file']->storeAs('files', $file->handle);

        $file->sha256 = $file->computeSha256();
        $file->save();

        Log::debug('New version for document uploaded', ['file' => $file, 'document' => $document]);

        return redirect()->route('board.edit', ['document' => $document->id])->with(['notistack' => ['success', 'Nuova versione caricata']]);
    }

    public function delete_post(Request $request, Document $document)
    {
        $this->authorize('edit', Document::class);

        foreach ($document->ratifications as $rat) {
            Log::debug('Ratification nulled', $rat);
            $rat->document()->associate(null)->save();
        }

        Log::debug('Document deleted', $document);

        $document->delete();

        return redirect()->route('board')->with(['notistack' => ['success', 'Eliminato']]);
    }

    public function add_ratification_post(Request $request)
    {
        $this->authorize('edit', Document::class);

        $validated = $request->validate([
            'document' => 'required|exists:documents,id',
            'ratification' => 'required|exists:ratifications,id'
        ]);

        $doc = Document::find($validated['document']);
        $rat = Ratification::find($validated['ratification']);

        if ($rat->document)
            return redirect()->back()->with('notistack', ['error', 'Ratifica già assegnata']);

        $rat->document()->associate($doc)->save();
        $alumnus = $rat->alumnus;
        $alumnus->status = $rat->required_state;
        $alumnus->save();
        Log::debug('Ratification approved', ['ratification' => $rat, 'document' => $doc]);

        return redirect()->back()->with(['notistack' => ['success', 'Associata']]);
    }

    public function remove_ratification_post(Request $request)
    {
        $this->authorize('edit', Document::class);

        $validated = $request->validate([
            'ratification' => 'required|exists:ratifications,id',
            'new_state' => 'required|in:' . implode(',', Alumnus::availableStatus())
        ]);

        $rat = Ratification::find($validated['ratification']);

        $rat->document()->associate(null)->save();
        $alumnus = $rat->alumnus;
        $alumnus->status = $validated['new_state'];
        $alumnus->save();
        Log::debug('Ratification nulled', ['ratification' => $rat, 'new alumnus status' => $alumnus->status]);

        return redirect()->back()->with(['notistack' => ['success', 'Annullata']]);
    }

    public function view_document($protocol)
    {
        $document = Document::where('protocol', $protocol)->first();
        if (!$document)
            return redirect()->back()->with('notistack', ['error', 'Documento non trovato']);

        $this->authorize('view', $document);
        return $this->view_file($document->files()->latest()->first());
    }

    public function view_file(File $file)
    {
        if ($file->parent_type == Document::class) {
            $this->authorize('view', $file->parent);
        } else {
            return abort('403');
        }

        // Check for sha256
        if (!$file->verifyHash()) {
            Log::error('File hash mismatch', ['file' => $file, 'fromDatabase' => $file->sha256, 'fromFile' => $file->computeSha256()]);
            return redirect()->back()->with('errorsDialogs', ["Il file richiesto è corrotto. Contatta gli amministratori."]);
        }

        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile($file->path());


        $all_versions = $file->parent->files()->oldest()->pluck('id')->toArray();
        $this_version = array_search($file->id, $all_versions) + 1;
        $latest = ($this_version == count($all_versions));

        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        $pdf->SetAutoPageBreak(false);
        $pdf->SetFont('Helvetica');
        $pdf->SetFontSize('10');
        $pdf->SetTextColor(255, 0, 0);

        $header = '=== VERSIONE OBSOLETA! Una nuova versione del documento è presente sul portale ===';
        $footer = '=== Scaricato dal portale soci il ' . date('d/m/Y') . ' - Protocollo web ' . $file->parent->protocol . ' - Versione ' . $this_version . ' di ' . count($all_versions) . ' ===';

        for ($i = 1; $i <= $pageCount; $i++) {
            $id = $pdf->importPage($i);

            // Add a page
            $pdf->AddPage();
            $pdf->useTemplate($id, 0, 0, null, null, true);

            // Add watermark on the bottom
            $pdf->SetXY(0, -10);
            $pdf->Cell(0, 7, $footer, 0, 0, 'C');

            // Add watermark on the top for obsolete
            if (!$latest) {
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
