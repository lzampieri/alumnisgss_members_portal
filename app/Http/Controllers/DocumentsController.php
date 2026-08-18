<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DynamicPermission;
use App\Models\File;
use App\Models\Ratification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class DocumentsController extends Controller
{
    public function list()
    {
        // No authorization: visible by anyone

        $params = [];

        $params['documents'] = Document::whereNull('attached_to_id')
            ->with(['author', 'dynamicPermissions', 'dynamicPermissions.role'])
            ->with(['attachments', 'attachments.author'])
            ->orderBy('date', 'desc')->orderBy('protocol', 'desc')->get()
            ->filter->can_view->values();
        $params['total'] = Document::count();

        $params['canUpload'] = Auth::check() && Auth::user()->can('create', Document::class);

        return Inertia::render('Board/List', $params);
    }

    public function add()
    {
        $this->authorize('create', Document::class);

        return Inertia::render('Board/Upload', [
            'roles' => Role::where('name', '!=', 'webmaster')->orderBy('id')->get(),
            'open_rats' => Ratification::whereNull('document_id')->with('alumnus')->get()
                ->sortBy(function ($rat, $key) {
                    return str_pad($rat->alumnus->coorte, 4, 0, STR_PAD_LEFT) . " " . $rat->alumnus->surname . " " . $rat->alumnus->name;
                })
                ->groupBy('required_state'),
            'parentable' => Document::whereNull('attached_to_id')->latest()->get(),
            'can_edit' => Auth::user()->hasPermissionTo('documents-edit')
        ]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('create', Document::class);

        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:now',
            'prehandle' => 'required|min:5|max:5',
            'note' => '',
            'attached_to_id' => 'integer|exists:documents,id|nullable',
            'roles' => 'exclude_unless:attached_to_id,null|required|array|min:1',
            'roles.*' => 'exclude_unless:attached_to_id,null|integer|exists:roles,id',
            'ratifications' => 'array',
            'ratifications.*' => 'integer|exists:ratifications,id',
            'file' => 'required|mimes:pdf',
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

        $validated['author_id'] = Auth::user()->id;
        $validated['protocol'] = $validated['prehandle'];

        // Create the document
        $document = Document::create($validated);

        // Create the protocol
        $protocol = $validated['prehandle'] . str_pad($document->id, 6, '0', STR_PAD_LEFT);
        $document->protocol = $protocol;
        $document->save();

        // Save the file
        $file = File::create();
        $file->handle =  'file_' . $file->id . '.pdf';
        $file->parent()->associate($document)->save();
        $validated['file']->storeAs('files', $file->handle);

        $file->sha256 = $file->computeSha256();
        $file->save();

        // Save the visibility
        if (array_key_exists('roles', $validated))
            foreach ($validated['roles'] as $role) {
                $dynamicPermission = DynamicPermission::createFromRelations('view', $document, Role::findById($role));
            }

        // Validate ratifications
        if (array_key_exists('ratifications', $validated))
            foreach ($validated['ratifications'] as $rat) {
                $ratification = Ratification::find($rat);
                $ratification->document()->associate($document)->save();

                $alumnus = $ratification->alumnus;
                $ratification->state_at_document_emission = $alumnus->status;
                $ratification->save();

                $alumnus->status = $ratification->required_state;
                $alumnus->save();
            }

        return redirect()->route('board')->with(['notistack' => ['success', 'Documento caricato con protocollo ' . $protocol]]);
    }

    public function edit(Document $document)
    {
        $this->authorize('edit', $document);

        // Clean non-existing dynamic permissions
        foreach ($document->dynamicPermissions as $dp) {
            if (!Role::find($dp->role_id))
                $dp->delete();
        }

        $document->grouped_ratifications = $document->ratifications->load('alumnus')->groupBy('required_state');
        $document->load(['files', 'dynamicPermissions', 'attached_to']);

        return Inertia::render('Board/Edit', [
            'document' => $document,
            'roles' => Role::where('name', '!=', 'webmaster')->orderBy('id')->get(),
            'available_ratifications' => Ratification::whereNull('document_id')->with('alumnus')->get()->groupBy('required_state'),
            'parentable' => Document::whereNull('attached_to_id')->where('id', '!=', $document->id)->latest()->get()
        ]);
    }

    public function edit_post(Request $request, Document $document)
    {
        $this->authorize('edit', $document);

        $validated = $request->validate([
            'attached_to_id' => 'integer|exists:documents,id|nullable',
            'roles' => 'exclude_unless:attached_to_id,null|required|array|min:1',
            'roles.*' => 'exclude_unless:attached_to_id,null|integer|exists:roles,id',
            'date' => 'required|date|before_or_equal:now',
            'note' => '',
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

        // If the document is not attached to other ones, check the roles
        if (array_key_exists('roles', $validated)) {
            $current_roles = $document->dynamicPermissions->pluck('role_id')->toArray();
            foreach (array_diff($current_roles, $validated['roles']) as $role) {
                // Roles to remove
                $dynamicPermission = $document->dynamicPermissions()->where('role_id', $role)->get();
                foreach ($dynamicPermission as $dp) {
                    $dp->delete();
                }
            }
            foreach (array_diff($validated['roles'], $current_roles) as $role) {
                // Roles to add
                $dynamicPermission = DynamicPermission::createFromRelations('view', $document, Role::findById($role));
            }
        }

        return redirect()->route('board')->with(['notistack' => ['success', 'Dati aggiornati']]);
    }

    public function new_version(Document $document)
    {
        $this->authorize('edit', $document);
        return Inertia::render('Board/NewVersion', ['document' => $document]);
    }

    public function new_version_post(Request $request, Document $document)
    {
        $this->authorize('edit', $document);

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

        return redirect()->route('board.edit', ['document' => $document->id])->with(['notistack' => ['success', 'Nuova versione caricata']]);
    }

    public function delete_post(Request $request, Document $document)
    {
        $this->authorize('delete', $document);

        foreach ($document->ratifications as $rat) {


            // Update alumnus only if its actual state is the same of the ratification
            $alumnus = $rat->alumnus;
            if ($alumnus->status == $rat->required_state) {
                $alumnus->status = $rat->state_at_document_emission;
                $alumnus->save();
            }

            $rat->state_at_document_emission = null;
            $rat->save();

            $rat->document()->associate(null)->save();
        }

        $document->delete();

        return redirect()->route('board')->with(['notistack' => ['success', 'Eliminato']]);
    }

    public function add_ratification_post(Request $request)
    {
        $validated = $request->validate([
            'document' => 'required|exists:documents,id',
            'ratification' => 'required|exists:ratifications,id'
        ]);

        $doc = Document::find($validated['document']);

        $this->authorize('edit', $doc);

        $rat = Ratification::find($validated['ratification']);

        if ($rat->document)
            return redirect()->back()->with('notistack', ['error', 'Ratifica già assegnata']);

        $rat->document()->associate($doc)->save();

        $alumnus = $rat->alumnus;
        $rat->state_at_document_emission = $alumnus->status;
        $rat->save();

        $alumnus->status = $rat->required_state;
        $alumnus->save();

        return redirect()->back()->with(['notistack' => ['success', 'Associata']]);
    }

    public function remove_ratification_post(Request $request)
    {
        $validated = $request->validate([
            'ratification' => 'required|exists:ratifications,id'
        ]);

        $rat = Ratification::find($validated['ratification']);

        $this->authorize('edit', $rat->document);

        $rat->document()->associate(null)->save();

        // Update alumnus only if its actual state is the same of the ratification
        $alumnus = $rat->alumnus;
        if ($alumnus->status == $rat->required_state) {
            $alumnus->status = $rat->state_at_document_emission;
            $alumnus->save();
        }

        $rat->state_at_document_emission = null;
        $rat->save();

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
            LogController::error('File hash mismatch', ['file' => $file, 'fromDatabase' => $file->sha256, 'fromFile' => $file->computeSha256()]);
            return redirect()->back()->with('errorsDialogs', ["Il file richiesto è corrotto. Contatta gli amministratori."]);
        }


        $all_versions = $file->parent->files()->oldest()->pluck('id')->toArray();
        $this_version = array_search($file->id, $all_versions) + 1;
        $latest = ($this_version == count($all_versions));

        \define('K_PATH_FONTS', substr( app_path(), 0, -3) . "vendor\\tecnickcom\\tc-lib-pdf-font\\target\\fonts");

        $pdf = new \Com\Tecnick\Pdf\Tcpdf();

        $sourceId = $pdf->setImportSourceFile($file->path());
        $pageCount = $pdf->getSourcePageCount($sourceId);
        $pdf->appendDocument($sourceId);

        $bfont = $pdf->font->insert($pdf->pon, 'helvetica', '', 10);

        $header = '=== VERSIONE OBSOLETA! Una nuova versione del documento é presente sul portale ===';
        $footer = '=== Scaricato dal portale soci il ' . date('d/m/Y') . ' - Protocollo web ' . $file->parent->protocol . ' - Versione ' . $this_version . ' di ' . count($all_versions) . ' ===';

        for ($i = 0; $i < $pageCount; $i++) {

            $pdf->page->addContent($bfont['out'], pid: $i);
            $pdf->page->addContent($pdf->color->getPdfColor('rgb(255,0,0)'), pid: $i);

            if (!$latest) {
                $pdf->addTextCellXY(
                    txt: $header,
                    pid: $i,
                    posx: 0,
                    posy: 3,
                    width: $pdf->page->getPage($i)['width'],
                    halign: 'C',
                    fill: true,
                    stroke: false,
                    drawcell: false
                );
            }

            $pdf->addTextCellXY(
                txt: $footer,
                pid: $i,
                posx: 0,
                posy: $pdf->page->getPage($i)['height'] - 10,
                width: $pdf->page->getPage($i)['width'],
                halign: 'C',
                fill: true,
                stroke: false,
                drawcell: false
            );
        }

        LogController::log(LogEvents::DOWNLOADED_FILE, $file);

        $pdf->setTitle($file->parent->identifier);
        $pdf->setPDFFilename($file->parent->protocol . '.pdf');

        $pdf->renderPDF($pdf->getOutPDFString());
        exit;
    }
}
