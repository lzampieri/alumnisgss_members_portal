<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Project;
use App\Models\Reimbursement;
use App\Utils\TemplatedPdfGenerator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ReimbursementController extends Controller
{
    public function home()
    {
        $reimbursements = Reimbursement::all()->filter->canView->load('project','author')->append(['can_edit','can_approve'])->values();

        $canCreate = Auth::check() && Auth::user()->can('create', Reimbursement::class);

        return Inertia::render(
            'Reimbursements/Home',
            [
                'reimbursements' => $reimbursements,
                'canCreate' => $canCreate
            ]
        );
    }

    public function create()
    {
        $this->authorize('create', Reimbursement::class);

        $reimbursement = Reimbursement::create([
            'total' => 0,
            'author_id' => Auth::user()->id
        ]);

        // If the user is not already a collaborator, add his profile
        if (!Auth::user()->collaborator) {
            Auth::user()->collaborator()->create([]);
        }

        return redirect()->route('reimbursements.edit', ['reimbursement' => $reimbursement]);
    }

    public function edit(Reimbursement $reimbursement)
    {
        $this->authorize('edit', $reimbursement);

        if (!Auth::user()->collaborator) {
            Auth::user()->collaborator()->create([]);
        }

        $projects = Project::all()->append(['can_view'])->filter->can_view->filter->open->values();

        $reimbursement->load(['project', 'author', 'author']);
        $reimbursement->author->load('collaborator')->makeVisible('collaborator');

        if ($reimbursement->project) { // TODO test this
            if (!in_array($reimbursement->project_id, $projects->pluck('id')->toArray())) {
                $projects->prepend($reimbursement->project);
            }
        }

        return Inertia::render('Reimbursements/Edit', [
            'reimbursement' => $reimbursement,
            'projects' => $projects,
            'allowedFormats' => [...File::ALLOWED_FORMATS, ...File::ALLOWED_IMAGES_FORMATS]
        ]);
    }

    public function autosave(Reimbursement $reimbursement, Request $request)
    {
        if (!Auth::check() || !Auth::user()->can('edit', $reimbursement))
            return response('', 403);

        $output = $this->save_reimbursement($reimbursement, $request, true);

        return response(json_encode($output), array_key_exists('errors', $output) ? 422 : 200);
    }

    public function save_draft(Reimbursement $reimbursement, Request $request)
    {
        $this->authorize('edit', $reimbursement);

        $output = $this->save_reimbursement($reimbursement, $request, true);

        if (array_key_exists('errors', $output)) {
            return redirect()->back()->withErrors($output['errors']);
        }

        return redirect()->back()->with(['notistack' => ['info', 'Bozza salvata']]);
    }

    public function save_final(Reimbursement $reimbursement, Request $request)
    {
        $this->authorize('edit', $reimbursement);

        $output = $this->save_reimbursement($reimbursement, $request, false);

        if (array_key_exists('errors', $output)) {
            return redirect()->back()->withErrors($output['errors']);
        }

        return redirect()->back()->with(['notistack' => ['info', 'Bozza salvata']]);
    }
    
    private function add_error(array &$errors, int $id, string $field, string $message)
    {
        if (!array_key_exists($id, $errors)) {
            $errors[$id] = [];
        }
        $errors[$id][$field] = $message;
    }

    private function save_reimbursement(Reimbursement $reimbursement, Request $request, bool $draft): array
    {
        $nullable = $draft ? 'nullable' : 'required';

        $validator = Validator::make($request->all(), [
            'project_id' => $nullable . '|numeric|exists:projects,id',
            'motivation' => $nullable . '|string',
            'IBAN' => $nullable . '|string',
            'holder' => $nullable . '|string',
            'bank' => $nullable . '|string',
            'content' => $nullable . '|array',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors()->toArray()];
        }

        $validated = $validator->validated();

        // Project ID
        // Update only if different
        if ($validated['project_id'] && $validated['project_id'] != $reimbursement->project_id) {
            $project = Project::find($validated['project_id']);
            if (! $project) {
                return ['errors' => ['project_id' => ['Progetto non trovato']]];
            }
            if (! $project->can_view) {
                return ['errors' => ['project_id' => ['Progetto non autorizzato']]];
            }
            $reimbursement->project_id = $validated['project_id'];
        }

        // Text fields
        $reimbursement->motivation = $validated['motivation'];
        $reimbursement->notes = $validated['notes'];

        // Collaborator
        $collaborator = $reimbursement->author->collaborator;
        $collaborator->IBAN = $validated['IBAN'];
        $collaborator->holder = $validated['holder'];
        $collaborator->bank = $validated['bank'];
        $collaborator->save();

        // Content
        $total = 0;
        $content_unparsed = $validated['content'];
        $content = [];
        $content_errors = [];
        foreach ($content_unparsed as $item) {
            if (!array_key_exists('type', $item) || !array_key_exists('id', $item)) {
                return ['errors' => ['content' => ['Errore nei dati. Riprovare.']]];
            };

            // Material
            if ($item['type'] == 'material') {

                if (!$draft) {
                    // Validate if it is not a draft
                    $validator = Validator::make($item, [
                        'title' => 'required|string|min:3',
                        'place' => 'required|string|min:3',
                        'date' => 'required|date|before:today',
                        'price' => 'required|numeric|gt:0',
                        'files' => 'required|array|min:1',
                        'id' => 'required|numeric'
                    ]);

                    if ($validator->fails()) {
                        $content_errors[$item['id']] = $validator->errors()->toArray();
                    }
                }

                $total += $item['price'] ?? 0;
                $content[] = $item;
            }

            // Travel
            else if ($item['type'] == 'travel') {

                if (!$draft) {
                    // Validate if it is not a draft
                    $validator = Validator::make($item, [
                        'way' => 'required|string|min:3',
                        'from' => 'required|string|min:3',
                        'to' => 'required|string|min:3',
                        'date' => 'required|date|before:today',
                        'price' => 'required|numeric|gt:0',
                        'files' => 'required|array|min:1',
                        'id' => 'required|numeric'
                    ]);

                    if ($validator->fails()) {
                        $content_errors[$item['id']] = $validator->errors()->toArray();
                    }
                }

                $total += $item['price'] ?? 0;
                $content[] = $item;
            }

            // Driving
            else if ($item['type'] == 'driving') {

                if (!$draft) {
                    // Validate if it is not a draft
                    $validator = Validator::make($item, [
                        'date' => 'required|date|before:today',
                        'from.id' => 'required|string',
                        'from.name' => 'required|string',
                        'to.id' => 'required|string',
                        'to.name' => 'required|string',
                        'id' => 'required|numeric'
                    ]);

                    if ($validator->fails()) {
                        $content_errors[$item['id']] = $validator->errors()->toArray();
                    }
                }

                $newItem = [
                    'from' => $item['from'] ?? [],
                    'to'   => $item['to'] ?? [],
                    'type' => 'driving',
                    'date' => $item['date'] ?? '',
                    'id'   => $item['id']
                ];

                // If the from and to are set...
                if (array_key_exists('id', $newItem['from']) && array_key_exists('id', $newItem['to'])) {

                    // Before going with the API key call, let's check if
                    // we already have computed the distance
                    $computed = false;
                    foreach ($reimbursement->content as $c) {
                        if ($c['type'] == 'driving' && array_key_exists('distance', $c)) {
                            if ($c['from']['id'] == $item['from']['id'] && $c['to']['id'] == $item['to']['id']) {
                                $computed = true;
                                $newItem['distance'] = $c['distance'];
                                break;
                            }
                        }
                    }

                    if (!$computed) {
                        $res = $this->compute_driving($item, false);
                        if ($res['distance'] < 0 ) {
                            $this->add_error($content_errors, $item['id'], 'distance', 'Impossibile calcolare la distanza, seleziona indirizzi più precisi.');
                        } else if( $res['distance'] == 0 ) {
                            $this->add_error($content_errors, $item['id'], 'distance', 'Seleziona due indirizzi distinti.');
                        } else {
                            $newItem['distance'] = $res['distance'];
                        }
                    }
                }

                $content[] = $newItem;
            }
        }

        $reimbursement->total = $total;
        $reimbursement->content = $content;
        $reimbursement->save();

        if (!$draft && count($content_errors) > 0) {
            return ['errors' => ['content_errors' => json_encode($content_errors)]];
        }

        return ['success' => 'Bozza salvata'];
    }

    public function uploadFiles(Reimbursement $reimbursement, Request $request)
    {
        $this->authorize('edit', $reimbursement);

        $validated = $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|mimes:' . implode(",", [...File::ALLOWED_FORMATS, ...File::ALLOWED_IMAGES_FORMATS])
        ]);

        $outputs = [];

        foreach ($validated['files'] as $attch) {
            $filename = $attch->getClientOriginalName();
            $extension = pathinfo($filename)['extension'];

            // Compute cleaned file name
            $cleaned_name = preg_replace("([^\w\s\d\_])", "", str_replace(" ", "_", pathinfo($filename)['filename']));

            // Upload file
            $file = File::create();
            $file->handle =  $reimbursement->iden . '_R' . $file->id . '_' . $cleaned_name  . '.' . $extension;
            $file->parent()->associate($reimbursement);
            $file->save();

            $attch->storeAs('files', $file->handle);

            $outputs[] = $file;
        }

        return response()->json($outputs);
    }

    private function compute_driving(array $item, bool $withPdf, string $iden = ''): array {
        $out = [];
        
        $routes = GoogleAPI::computeRoutes($item['from']['id'], $item['to']['id'])['routes'];
        if( empty($routes) ) return ['distance' => -1];
        $distances = array_map(fn($r) => $r['distanceMeters'], $routes);
        $minDistance = round(min($distances) / 1000);
        if ($minDistance == 0)
            return ['distance' => 0];
        $out['distance'] = $minDistance;

        if($withPdf) {
            $pdf = new TemplatedPdfGenerator();

            $pdf->SetTitle("Calcolo rimborso chilometrico {$iden}.{$item['id']}");
            $pdf->SetAuthor("Portale soci");

            $pdf->AddPage();

            $pdf->HTMLhere("<small>Riferimento interno: {$iden}.{$item['id']}</small>", 'R');
            $pdf->HTMLhere('<b>Calcolo rimborso chilometrico</b>');
            $pdf->spacing();
            $pdf->HTMLhere("<b>Da</b>: {$item['from']['name']} [{$item['from']['id']}]");
            $pdf->HTMLhere("<b>A</b>: {$item['to']['name']} [{$item['to']['id']}]");
            $pdf->spacing();
            $pdf->HTMLhere("Distanza calcolata dall'endpoint routes.googleapis.com il giorno " . Carbon::now()->format('d/m/Y'));
            $pdf->HTMLhere($out['distance'] . " km");

            
            $output_filename = storage_path("app/reimbursements/parts/{$iden}_{$item['id']}.pdf");
            $pdf->Output( $output_filename, 'F');
            $out['filename'] = $output_filename;
        }

        return $out;
    }

    public function generate_PDF(Reimbursement $reimbursement) {

        $filesToAppend = [];
        $total_material = 0;
        $total_travel = 0;
        $total_driving = 0;
        $content = $reimbursement->content;

        $pdf = new TemplatedPdfGenerator();

        $pdf->SetTitle('Richiesta di rimborso');
        $pdf->SetAuthor($reimbursement->author->surnameAndName());

        $pdf->AddPage();

        $pdf->HTMLhere("<small>Riferimento interno: {$reimbursement->iden}</small>", 'R');
        $pdf->HTMLhere('<h2>Richiesta di rimborso</h2>', 'C');
        $pdf->spacing();
        $pdf->HTMLhere("<b>Progetto</b>: {$reimbursement->project->title}");

        $pdf->spacing();
        $pdf->HTMLhere("La/Il sottoscritta/o <b>{$reimbursement->author->nameAndSurname()}</b> dichiara di aver svolto, nell'ambito del progetto indicato, il seguente incarico:");
        $pdf->HTMLhere("<i>{$reimbursement->motivation}</i>");

        $pdf->spacing();
        $pdf->HTMLhere("Al fine di svolgere l'incarico affidato, ha sostenuto le seguenti spese:");
        
        $pdf->spacing(2);
        $pdf->HTMLhere('<b>Materiali didattici</b>', 'C');
        foreach ($content as $item) {
            if( $item['type'] == 'material') {
                $date = Carbon::parse($item['date'])->format('d/m/Y');
                $price = number_format($item['price'], 2, ',', ' ');
                $pdf->HTMLhere("{$item['title']}");
                $pdf->HTMLhere("<small>Acquistati il {$date} presso {$item['place']}</small>");
                $pdf->HTMLhere("€ {$price}", 'R');
                foreach ($item['files'] as $file) {
                    // TODO add check that files exists!
                    $filesToAppend[] = File::find($file['id'])->path();
                }
                $total_material += $item['price'];
            }
        };

        $pdf->spacing(2);
        $pdf->HTMLhere('<b>Mezzi di transporto pubblici e pedaggi</b>', 'C');
        foreach ($content as $item) {
            if( $item['type'] == 'travel') {
                $date = Carbon::parse($item['date'])->format('d/m/Y');
                $price = number_format($item['price'], 2, ',', ' ');
                $pdf->HTMLhere("{$item['way']}: da {$item['from']} a {$item['to']}");
                $pdf->HTMLhere("<small>Viaggio del {$date}</small>");
                $pdf->HTMLhere("€ {$price}", 'R');
                foreach ($item['files'] as $file) {
                    // TODO add check that files exists!
                    $filesToAppend[] = File::find($file['id'])->path();
                }
                $total_travel += $item['price'];
            }
        };

        $pdf->spacing(2);
        $pdf->HTMLhere('<b>Viaggio con mezzo proprio</b>', 'C');
        foreach ($content as &$item) {
            if( $item['type'] == 'driving') {
                $res = $this->compute_driving($item, true, $reimbursement->iden);
                $item['distance'] = $res['distance']; 
                $filesToAppend[] = $res['filename'];

                $date = Carbon::parse($item['date'])->format('d/m/Y');
                $price = 0;
                $pdf->HTMLhere("Da {$item['from']['name']} a {$item['to']['name']}");
                $pdf->HTMLhere("<small>Viaggio del {$date} - distanza {$item['distance']} km</small>");
                $pdf->HTMLhere("€ {$price}", 'R');
                $total_driving += 0;
            }
        };

        $reimbursement->content = $content;
        $reimbursement->save();

        $pdf->spacing(2);
        $pdf->HTMLhere("Totale materiale: ");
        $pdf->HTMLhere("€ " . number_format($total_material, 2, ',', ' '), 'R');
        $pdf->HTMLhere("Totale mezzi pubblici: ");
        $pdf->HTMLhere("€ " . number_format($total_travel, 2, ',', ' '), 'R');
        $pdf->HTMLhere("Totale mezzi propri: ");
        $pdf->HTMLhere("€ " . number_format($total_driving, 2, ',', ' '), 'R');
        $pdf->HTMLhere("<b>Totale: </b>");
        $pdf->HTMLhere("<b>€ " . number_format($total_material + $total_travel + $total_driving, 2, ',', ' ') . "</b>", 'R');

        $pdf->spacing(2);
        $count_files = count($filesToAppend);
        $pdf->HTMLhere("La/Il sottoscritta/o certifica che tutto quanto dichiarato nella presente domanda di rimborso corrisponde al vero; in allegato {$count_files} ricevute.");

        $pdf->spacing(2);
        $pdf->HTMLhere("Il rimborso sarà effettuato a mezzo bonifico alle seguenti coordinate bancarie:");
        $pdf->HTMLhere("IBAN: {$reimbursement->author->collaborator->IBAN}");
        $pdf->HTMLhere("Intestato a: {$reimbursement->author->collaborator->holder}");
        $pdf->HTMLhere("Presso: {$reimbursement->author->collaborator->bank}");

        $output_filename = storage_path("app/reimbursements/parts/{$reimbursement->iden}.pdf");
        $pdf->Output( $output_filename, 'F');


        // Use now the tc-lib-pdf to merge all the PDFs in a single file
        $merged = new \Com\Tecnick\Pdf\Tcpdf(
            'mm', true, false, true, '', null, [
                'allowedPaths' => [storage_path()]
            ]
        );

        // Main file
        $sourceId = $merged->setImportSourceFile($output_filename);
        $merged->appendDocument($sourceId);

        // Attachments
        foreach ($filesToAppend as $file) {
            if( str_ends_with( $file, '.pdf' ) ) {
                // It's a PDF, import it!
                $sourceId = $merged->setImportSourceFile($file);
                $merged->appendDocument($sourceId);
            } else {
                // It's an image, create a page!
                $px_to_cm = 0.085;
                $iid = $merged->image->add($file);
                $key = $merged->image->getKey($file);
                $dim = $merged->image->getImageDimensionsByKey($key);
                $out = $merged->image->getSetImage($iid, 0, 0, $dim['width'] * $px_to_cm, $dim['height'] * $px_to_cm, $dim['height'] * $px_to_cm);
                $merged->addPage([
                    'width' => $dim['width'] * $px_to_cm,
                    'height' => $dim['height'] * $px_to_cm
                ]);
                $merged->page->addContent($out);
            }
        }

        $merged->SetTitle('Richiesta di rimborso ' . $reimbursement->iden);
        $merged->SetAuthor($reimbursement->author->surnameAndName());
        $merged->setPDFFilename($reimbursement->iden . '.pdf');
        
        $merged_folder = storage_path("app/reimbursements/sent/");
        $rawpdf = $merged->getOutPDFString();

        $merged->savePDF($merged_folder, $rawpdf);
        $merged->renderPDF($rawpdf);

        exit;
    }
}
