<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Project;
use App\Models\Reimbursement;
use App\Utils\Settings;
use App\Utils\TemplatedPdfGenerator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Mail\Mailer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ReimbursementController extends Controller
{
    public function home()
    {
        // todo add authorization here

        $reimbursements = Reimbursement::orderBy('created_at', 'desc')->get()->filter->canView->load('project', 'author')->append(['can_edit', 'can_view'])->values();

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

        $this->generate_PDF($reimbursement);

        return redirect()->route('reimbursements.review', ['reimbursement' => $reimbursement]);
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
                        'carPower' => 'required|string',
                        'carModel' => 'required|string',
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
                    'carPower' => $item['carPower'] ?? '',
                    'carModel' => $item['carModel'] ?? '',
                    'id'   => $item['id']
                ];

                if (!$draft) {

                    // Compute the 
                    $res = $this->compute_driving($item, false);
                    if ($res['distance'] < 0) {
                        $this->add_error($content_errors, $item['id'], 'distance', 'Impossibile calcolare la distanza, seleziona indirizzi più precisi.');
                    } else if ($res['distance'] == 0) {
                        $this->add_error($content_errors, $item['id'], 'distance', 'Seleziona due indirizzi distinti.');
                    } else if (!array_key_exists('car', $res)) {
                        $this->add_error($content_errors, $item['id'], 'car', 'Impossibile ritrovare il veicolo selezionato.');
                    } else if (!array_key_exists('prices', $res)) {
                        $this->add_error($content_errors, $item['id'], 'price', 'Impossibile calcolare il prezzo.');
                    } else {
                        $newItem += $res;
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

    const NAMES = [
        'petrol' => 'Benzina',
        'diesel' => 'Gasolio',
        'gpl' => 'GPL',
        'methane' => 'Metano',
        'electricity' => 'Elettricità'
    ];
    const UNITS = [
        'petrol' => '€/L',
        'diesel' => '€/L',
        'gpl' => '€/L',
        'methane' => '€/kg',
        'electricity' => '€/kWh',
    ];
    const REVUNITS = [
        'petrol' => 'L/100km',
        'diesel' => 'L/100km',
        'gpl' => 'L/100km',
        'methane' => 'kg/100km',
        'electricity' => 'kWh/100km',
    ];

    private function compute_driving(array $item, bool $withPdf, string $iden = ''): array
    {
        $out = [];


        // Distance
        $routes = APIs::computeRoutes($item['from']['id'], $item['to']['id'])['routes'];
        if (empty($routes)) return ['distance' => -1];
        $distances = array_map(fn($r) => $r['distanceMeters'], $routes);
        $minDistance = round(min($distances) / 1000);
        if ($minDistance == 0)
            return ['distance' => 0];
        $out['distance'] = $minDistance;

        // Car
        $car = false;
        foreach (APIs::getAciTable() as $c) {
            if ($c['power'] == $item['carPower'] && $c['label'] == $item['carModel']) {
                $car = $c;
                break;
            }
        }
        if (!$car) return $out;
        $out['car'] = $car;

        // Carburants
        $prices = APIs::getAciPrices(Carbon::createFromFormat("Y-m-d", $item['date']));
        if (empty($prices['prices'])) return $out;
        $out['prices'] = $prices;

        // Total count
        $considered_prices = [];
        $total_price = 0;
        foreach ($car['consumption'] as $carb => $cons) {
            $carbprice = $prices['prices'][$carb];
            $considered_prices[$carb] = $carbprice;
            $total_price += $cons * $carbprice / 100;
        }
        $out['total_price_fuel'] = $total_price;
        $out['considered_prices'] = $considered_prices;

        $out['total_price_km'] = $car['QUOTA_CAPITALE'] + $out['total_price_fuel'] + $car['QUOTA_PNEUMATICI'] + $car['QUOTA_MANUTENZIONE'];

        $out['price'] = round($out['total_price_km'] * $minDistance * 100) / 100;

        if ($withPdf) {
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
            $pdf->spacing();

            $pdf->HTMLhere("<b>Veicolo</b>: " . $out['car']['label']);
            $pdf->HTMLhere("<b>Alimentazione</b>: " . $out['car']['power']);
            $cons_str = [];
            foreach ($out['car']['consumption'] as $carb => $cons) {
                $cons_str[] = ReimbursementController::NAMES[$carb] . ": " . number_format($cons, 3, ',', ' ') . " " . ReimbursementController::UNITS[$carb];
            }
            $pdf->HTMLhere("<b>Consumi</b>: " . implode(" + ", $cons_str));

            $pdf->spacing();

            $pdf->HTMLhere("<b>Prezzi dei carburanti considerati:</b>");
            $pdf->HTMLhere("Calcolati dai dati forniti da ACI (ultimo aggiornamento " . Carbon::parse($out['prices']['updated'])->format("d/m/Y") . ")");
            $pdf->HTMLhere("Data del viaggio: " . $out['prices']['forDate'] . " - rilevazione utile: " . $out['prices']['realDate']);
            foreach ($out['considered_prices'] as $carb => $price) {
                $pdf->HTMLhere(ReimbursementController::NAMES[$carb] . ": " . number_format($price, 3, ',', ' ') . " " . ReimbursementController::UNITS[$carb]);
            }
            $pdf->spacing();

            $pdf->HTMLhere("Quota capitale");
            $pdf->HTMLhere("€/km " . number_format($car['QUOTA_CAPITALE'], 3, ',', ' '), "R");
            $pdf->HTMLhere("Quota carburante");
            $pdf->HTMLhere("€/km " . number_format($out['total_price_fuel'], 3, ',', ' '), "R");
            $pdf->HTMLhere("Quota pneumatici");
            $pdf->HTMLhere("€/km " . number_format($car['QUOTA_PNEUMATICI'], 3, ',', ' '), "R");
            $pdf->HTMLhere("Quota manutenzione");
            $pdf->HTMLhere("€/km " . number_format($car['QUOTA_MANUTENZIONE'], 3, ',', ' '), "R");
            $pdf->HTMLhere("Totale");
            $pdf->HTMLhere("€/km " . number_format($out['total_price_km'], 3, ',', ' '), "R");

            $pdf->spacing(2);
            $pdf->HTMLhere("<b>Totale da rimborsare</b>:");
            $pdf->HTMLhere("<b>€ " . number_format($out['price'], 2, ',', ' ') . "</b>", "R");

            $output_filename = storage_path("app/reimbursements/parts/{$iden}_{$item['id']}.pdf");
            $pdf->Output($output_filename, 'F');
            $out['filename'] = $output_filename;
        }

        return $out;
    }

    public function generate_PDF(Reimbursement $reimbursement): string
    {

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
            if ($item['type'] == 'material') {
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
            if ($item['type'] == 'travel') {
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
            if ($item['type'] == 'driving') {
                $res = $this->compute_driving($item, true, $reimbursement->iden);
                $item += $res;
                $filesToAppend[] = $res['filename'];

                $date = Carbon::parse($item['date'])->format('d/m/Y');
                $price = number_format($item['price'], 2, ',', ' ');
                $pdf->HTMLhere("Da {$item['from']['name']} a {$item['to']['name']}");
                $pdf->HTMLhere("<small>Viaggio del {$date} - distanza {$item['distance']} km</small>");
                $pdf->HTMLhere("€ {$price}", 'R');
                $total_driving += $res['price'];
            }
        };

        $reimbursement->content = $content;
        $reimbursement->total = $total_material + $total_travel + $total_driving;
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

        if (strlen($reimbursement->notes) > 0) {
            $pdf->spacing(2);
            $pdf->HTMLhere("Nota: {$reimbursement->notes}");
        }

        $pdf->spacing(2);
        $pdf->HTMLhere("Lì, " . Carbon::now()->format('d/m/Y'));
        $pdf->HTMLhere($reimbursement->author->nameAndSurname(), 'R');
        $email = Auth::user()->logged_in_email->address;
        $pdf->HTMLhere("<small>Indentificato mezzo email - {$email}</small>", 'R');

        $output_filename = storage_path("app/reimbursements/parts/{$reimbursement->iden}.pdf");
        $pdf->Output($output_filename, 'F');


        // Use now the tc-lib-pdf to merge all the PDFs in a single file
        $merged = new \Com\Tecnick\Pdf\Tcpdf(
            'mm',
            true,
            false,
            true,
            '',
            null,
            [
                'allowedPaths' => [storage_path()]
            ]
        );

        // Main file
        $sourceId = $merged->setImportSourceFile($output_filename);
        $merged->appendDocument($sourceId);

        // Attachments
        foreach ($filesToAppend as $file) {
            if (str_ends_with($file, '.pdf')) {
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

        return $merged_folder . $reimbursement->iden . '.pdf';
    }

    public function review(Reimbursement $reimbursement)
    {
        $this->authorize('edit', $reimbursement);

        return Inertia::render('Reimbursements/Review', [
            'reimbursement' => $reimbursement
        ]);
    }

    public function send(Reimbursement $reimbursement)
    {
        $this->authorize('edit', $reimbursement);

        $file = storage_path("app/reimbursements/sent/") . $reimbursement->iden . '.pdf';
        if (!file_exists($file)) {
            return redirect()->back()->with('notistack', ['error', 'Rimborso non correttamente generato.']);
        }

        $to = Settings::get('reimbursements_sent_email_to', 'info@alumniscuolagalileiana.it');
        // TODO: check if francesca and send to tesoreria@

        $date = Carbon::now()->format('d/m/Y');
        $goto = route('reimbursements.view', $reimbursement);

        $message = "
Gent. segreteria,\n
In data {$date} è stata inviata da {$reimbursement->author->nameAndSurname()} una nuova richiesta di rimborso relativa al progetto {$reimbursement->project->name}.\n
In allegato la richiesta di rimborso.\n
\n
Per verificare lo stato della richiesta o per approvarla - se autorizzato - si acceda all'indirizzo seguente:\n
<a href='{$goto}'>{$goto}<a>\n
\n
Cordiali saluti.\n
\n
\n
Email generata automaticamente.
        ";

        MailerController::sendEmail(
            explode(",", $to),
            "Nuova richiesta di rimborso: " . $reimbursement->iden,
            $message,
            replyTo: Auth::user()->logged_in_email->address,
            attachments: [$file],
            cc: [Auth::user(), Auth::user()->logged_in_email->address]
        );

        $reimbursement->sent = Carbon::now();
        $reimbursement->save();

        return redirect()->route('reimbursements.view', ['reimbursement' => $reimbursement])->with('inertiaFlash', ['justSent' => true]);
    }

    public function approve(Reimbursement $reimbursement)
    {
        $this->authorize('approve', $reimbursement);


        $file = storage_path("app/reimbursements/sent/") . $reimbursement->iden . '.pdf';
        if (!file_exists($file)) {
            return redirect()->back()->with('notistack', ['error', 'Rimborso non correttamente generato.']);
        }

        $to = explode(",", Settings::get('reimbursements_approved_email_to', 'tesoreria@alumniscuolagalileiana.it'));
        $cc = explode(",", Settings::get('reimbursements_sent_email_to', 'info@alumniscuolagalileiana.it'));

        $date_sent = $reimbursement->sent->format('d/m/Y');
        $date = Carbon::now()->format('d/m/Y');
        $goto = route('reimbursements.view', $reimbursement);

        $message = "
Gent. tesoreria,\n
Il rimborso inviato da {$reimbursement->author->nameAndSurname()} in data {$date_sent} è stato revisionato dalla segreteria in data {$date} e approvato per il pagamento.\n
In allegato la richiesta di rimborso.\n
\n
Per verificare lo stato della richiesta o per segnarla come pagata - se autorizzato - si acceda all'indirizzo seguente:\n
<a href='{$goto}'>{$goto}<a>\n
\n
Cordiali saluti.\n
\n
\n
Email generata automaticamente.
        ";

        MailerController::sendEmail(
            $to,
            "Nuova richiesta di pagamento: " . $reimbursement->iden,
            $message,
            replyTo: $cc[0],
            attachments: [$file],
            cc: [Auth::user(), Auth::user()->logged_in_email->address, ...$cc]
        );

        $reimbursement->approved = Carbon::now();
        $reimbursement->approver_id = Auth::user()->id;
        $reimbursement->save();
        return redirect()->route('reimbursements.view', ['reimbursement' => $reimbursement])->with('inertiaFlash', ['justApproved' => true]);
    }

    public function pay(Reimbursement $reimbursement)
    {
        $this->authorize('pay', $reimbursement);
        $reimbursement->paid = Carbon::now();
        $reimbursement->payer_id = Auth::user()->id;
        $reimbursement->save();
        return redirect()->route('reimbursements.view', ['reimbursement' => $reimbursement]);
    }

    public function view(Reimbursement $reimbursement)
    {
        $this->authorize('view', $reimbursement);
        $reimbursement->load('author', 'approver', 'payer');
        $reimbursement->append('can_approve', 'can_pay', 'can_internal');
        if ($reimbursement->can_internal) {
            $reimbursement->makeVisible('internal_notes');
        }
        return Inertia::render('Reimbursements/View', [
            'reimbursement' => $reimbursement,
        ]);
    }

    public function save_internal(Request $request, Reimbursement $reimbursement)
    {
        $this->authorize('internal', $reimbursement);

        $validated = $request->validate([
            'internal_notes' => 'nullable|string',
        ]);

        $reimbursement->internal_notes = $validated['internal_notes'];
        $reimbursement->save();

        return response("OK");
    }

    public function backToDraft(Reimbursement $reimbursement)
    {
        $this->authorize('redraft', $reimbursement);

        $reimbursement->sent = null;
        $reimbursement->approved = null;
        $reimbursement->paid = null;
        $reimbursement->save();
        return redirect()->route('reimbursements')->with('notistack', ['success', 'Rimborso ripristinato come bozza.']);
    }

    public function receipt(Reimbursement $reimbursement)
    {
        $this->authorize('view', $reimbursement);

        return response()->file(storage_path("app/reimbursements/sent/") . $reimbursement->iden . '.pdf');
    }

    public function approveReminder()
    {
        $reimbs = Reimbursement::whereNotNull('sent')->whereNull('approved')->get();

        if (count($reimbs)) {
            $output = "";
            $files = [];

            foreach ($reimbs as $reimbursement) {
                $price = number_format($reimbursement->total, 2, ',', ' ');
                $output .= "<a href='" . route('reimbursements.view', ['reimbursement' => $reimbursement]) . "'>{$reimbursement->iden}</a> da {$reimbursement->author->nameAndSurname()} sul progetto {$reimbursement->project->title} ({$price} €)<br>";
                
                $file = storage_path("app/reimbursements/sent/") . $reimbursement->iden . '.pdf';
                if (file_exists($file)) {
                    $files[] = $file;
                }
            }

            $to = Settings::get('reimbursements_sent_email_to', 'info@alumniscuolagalileiana.it');

            MailerController::sendEmail(
                explode(",", $to),
                "Promemoria: {$reimbs->count()} rimborso/i da approvare",
                "Gent. segreteria,\nNel portale risultano le seguenti richiese di rimborso in attesa di approvazione (richieste in allegato):\n" . $output . "\n\nCordiali saluti.\n\n\nEmail generata automaticamente ogni lunedì mattina.",
                attachments: $files
            );
        }

        return response("OK");
    }

    public function payReminder()
    {
        $reimbs = Reimbursement::whereNotNull('approved')->whereNull('paid')->get();

        if (count($reimbs)) {
            $output = "";
            $files = [];

            foreach ($reimbs as $reimbursement) {
                $price = number_format($reimbursement->total, 2, ',', ' ');
                $output .= "<a href='" . route('reimbursements.view', ['reimbursement' => $reimbursement]) . "'>{$reimbursement->iden}</a> da {$reimbursement->author->nameAndSurname()} sul progetto {$reimbursement->project->title} ({$price} €)<br>";
                
                $file = storage_path("app/reimbursements/sent/") . $reimbursement->iden . '.pdf';
                if (file_exists($file)) {
                    $files[] = $file;
                }
            }

            $to = Settings::get('reimbursements_approved_email_to', 'tesoreria@alumniscuolagalileiana.it');

            MailerController::sendEmail(
                explode(",", $to),
                "Promemoria: {$reimbs->count()} rimborso/i da pagare",
                "Gent. tesoreria,\nNel portale risultano le seguenti richiese di rimborso in attesa di pagamento (richieste in allegato):\n" . $output . "\n\nCordiali saluti.\n\n\nEmail generata automaticamente ogni lunedì mattina.",
                attachments: $files
            );
        }

        return response("OK");
    }
}
