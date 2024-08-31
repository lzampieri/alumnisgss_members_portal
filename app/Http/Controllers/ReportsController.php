<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Ratification;
use App\Utils\TemplatedPdfGenerator;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;

use function PHPSTORM_META\map;

class ReportsController extends Controller
{
    public function home()
    {
        $options = [
            ['name' => 'Ratifiche in attesa', 'url' => route('ratifications.export'), 'inertia' => FALSE, 'enabled' => Auth::user()->can('view', Ratification::class)],
            ['name' => 'Variazioni libri societari', 'url' => route('reports.members_variations'), 'inertia' => TRUE, 'enabled' => Auth::user()->can('view', Ratification::class)],
            // ['name' => 'Documents', 'url' => route('members')],
        ];

        $feasible_options = array_values(array_filter($options, function ($opt) {
            return array_key_exists('enabled', $opt) && $opt['enabled'];
        }));

        return Inertia::render('Reports/Home', ['options' => $feasible_options]);
    }

    public function members_variations()
    {
        // Home page for members book variations
        return Inertia::render('Reports/MembersVariations', [
            'av_statuses' => Alumnus::require_ratification
        ]);
    }

    // public function members_variations_estimate()
    // {

    // }

    public function members_variations_generate(Request $request)
    {
        $this->authorize('view', Ratification::class);

        $statuses = array_values(array_intersect(Alumnus::require_ratification, explode('.', $request->statuses)));

        if (count($statuses) < 1) {
            return back()->with('notistack', ['error', 'Selezionare almeno uno stato!']);
        }

        $from = Carbon::createFromTimestamp($request->from / 1000);
        $to = Carbon::createFromTimestamp($request->to / 1000);

        if ($from > $to) {
            return back()->with('notistack', ['error', 'La data di inizio non puè essere successiva alla data di fine!']);
        }

        $rats = Ratification::whereRelation('document', 'date', '>=', $from)
            ->whereRelation('document', 'date', '<=', $to)
            ->where(function (Builder $query) use ($statuses) {
                $query->whereIn('required_state', $statuses)
                    ->orWhereIn('state_at_document_emission', $statuses);
            })
            ->with(['alumnus', 'document'])
            ->get()
            ->sortBy(function ($rat, $key) {
                return str_pad($rat->coorte, 4, STR_PAD_LEFT) . " " . $rat->alumnus->surname . " " . $rat->alumnus->name;
            });

        $rats_entering = array_fill_keys($statuses, []);
        $rats_exiting = array_fill_keys($statuses, []);
        $rats_changing = array_fill_keys($statuses, array_fill_keys($statuses, []));

        foreach ($rats as $rat) {
            if (in_array($rat->required_state, $statuses)) {
                if (in_array($rat->state_at_document_emission, $statuses)) {
                    $rats_changing[$rat->state_at_document_emission][$rat->required_state][] = $rat;
                } else {
                    $rats_entering[$rat->required_state][] = $rat;
                }
            } elseif (in_array($rat->state_at_document_emission, $statuses)) {
                $rats_exiting[$rat->state_at_document_emission][] = $rat;
            }
        }



        $pdf = new TemplatedPdfGenerator();

        $pdf->SetTitle('Variazione ai libri sociali');
        $pdf->SetAuthor(Auth::user()->identity->surnameAndName());

        $pdf->AddPage();

        $pdf->HTMLhere('<b><h3>Variazioni ai libri sociali</h3></b>');
        $pdf->HTMLhere('Relative al periodo ' . $from->format('d/m/Y') . ' - ' . $to->format('d/m/Y'));

        if (count($statuses) > 1) {
            $pdf->HTMLhere('Relative alle cariche di ' . implode(", ", array_map(function ($s) {
                return Alumnus::AlumnusStatusLabels[$s];
            }, $statuses)));
        } else {
            $pdf->HTMLhere('Relative alla carica di ' . Alumnus::AlumnusStatusLabels[$statuses[0]]);
        }

        $pdf->spacing();


        // Ingressi
        foreach ($rats_entering as $k => $v) {
            if (count($v) == 0) continue;

            $pdf->HTMLenqueue('Sono stati iscritti allo stato di <i>' . Alumnus::AlumnusStatusLabels[$k] . '</i> (' . count($v) . '):');

            $pdf->HTMLenqueue('<ul>');
            foreach ($v as $a) {
                $pdf->HTMLenqueue("<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . ") - " . $a->document->date->format('d/m/Y') . "</li>");
            }
            $pdf->HTMLenqueue("</ul>");
            $pdf->HTMLenqueue("<br />");
        }

        // Spostamenti nel libro dei soci
        foreach ($rats_changing as $k_from => $vs) {
            foreach ($vs as $k_to => $v) {
                if (count($v) == 0) continue;

                $pdf->HTMLenqueue('Sono stati variati dallo stato di <i>' . Alumnus::AlumnusStatusLabels[$k_from] . '</i> allo stato di <i>' . Alumnus::AlumnusStatusLabels[$k_to] . '</i> (' . count($v) . '):');

                $pdf->HTMLenqueue('<ul>');
                foreach ($v as $a) {
                    $pdf->HTMLenqueue("<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . ") - " . $a->document->date->format('d/m/Y') . "</li>");
                }
                $pdf->HTMLenqueue("</ul>");
                $pdf->HTMLenqueue("<br />");
            }
        }

        // Rimorzioni dal libro dei soci
        foreach ($rats_exiting as $k => $v) {
            if (count($v) == 0) continue;

            $pdf->HTMLenqueue('Sono stati rimossi dallo stato di <i>' . Alumnus::AlumnusStatusLabels[$k] . '</i> (' . count($v) . '):');

            $pdf->HTMLenqueue('<ul>');
            foreach ($v as $a) {
                $pdf->HTMLenqueue("<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . ") - " . $a->document->date->format('d/m/Y') . "</li>");
            }
            $pdf->HTMLenqueue("</ul>");
            $pdf->HTMLenqueue("<br />");
        }

        if (count($rats) == 0) {
            $pdf->HTMLenqueue('Non risulta alcuna variazione ai libri sociali nel periodo in oggetto.');
            $pdf->HTMLenqueue("<br />");
            $pdf->HTMLenqueue("<br />");
        }

        $pdf->HTMLflush();
        $pdf->spacing();

        $pdf->HTMLenqueue("Padova, " . date('d/m/Y'));
        $pdf->HTMLenqueue("<br />");
        $pdf->HTMLenqueue("<small>Documento generato automaticamente dal Portale Soci dell'Associazione Alumni Scuola Galileiana</small>");

        $pdf->HTMLflush();
        $pdf->spacing();

        LogController::log(LogEvents::DOWNLOADED_REPORT);

        $pdf->Output('Variations.pdf', 'I');
        exit;
    }
}
