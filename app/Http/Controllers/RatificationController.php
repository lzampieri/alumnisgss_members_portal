<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Identity;
use App\Models\Ratification;
use App\Utils\TemplatedPdfGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RatificationController extends Controller
{
    public function list()
    {
        $this->authorize('view', Ratification::class);

        return Inertia::render('Ratifications/List', [
            'canAdd' => Auth::user()->can('edit', Ratification::class),
            'open_rats' => Ratification::whereNull('document_id')->with('alumnus')->get()
                ->sortBy(function ($rat, $key) {
                    return str_pad($rat->alumnus->coorte, 4, 0, STR_PAD_LEFT) . " " . $rat->alumnus->surname . " " . $rat->alumnus->name;
                })
                ->groupBy('required_state'),
            'closed_rats' => Ratification::whereNotNull('document_id')->with(['alumnus', 'document'])->get()
                ->sortBy(function ($rat, $key) {
                    return str_pad($rat->alumnus->coorte, 4, 0, STR_PAD_LEFT) . " " . $rat->alumnus->surname . " " . $rat->alumnus->name;
                })
                ->groupBy('required_state')
        ]);
    }


    public function add()
    {
        $this->authorize('edit', Ratification::class);

        return Inertia::render('Ratifications/Add', [
            'alumni' => Alumnus::with('ratifications')->get(),
            'possibleStatus' => Alumnus::status,
            'alumnus' => array_key_exists('alumnus', $_GET) ? Alumnus::find($_GET['alumnus']) : null
        ]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('edit', Ratification::class);

        $validated = $request->validate([
            'alumni_id' => 'required|array',
            'alumni_id.*' => 'exists:alumni,id',
            'required_state' => 'required|in:' . implode(',', Alumnus::status),
            'rat_force' => 'required|boolean'
        ]);

        $newrats = 0;
        $updated = 0;
        $already = 0;
        $rejected = 0;

        $reqState = $validated['required_state'];

        foreach ($validated['alumni_id']  as $al_id) {
            $alumnus = Alumnus::find($al_id);

            // Check that the alumnus does not already have the required state
            if( $alumnus->status == $reqState ) {
                $already++;
                continue;
            }

            // Check that no ratification exists sending the same alumnus to the same status
            if( $alumnus->pendingRatifications()->where('required_state', $reqState)->count() > 0 ) {
                $rejected++;
                continue;
            }

            // Check if status is freerly assignable
            if( !$validated['rat_force'] && in_array($reqState, Alumnus::availableStatus($alumnus)) ) {
                $alumnus->status = $reqState;
                $alumnus->save();
                $updated++;
                continue;
            }

            // Save the ratification
            Ratification::create(['alumnus_id' => $al_id, 'required_state' => $reqState]);
            $newrats++;
        }

        $output = ["Helloo"];
        if ($newrats > 0) $output[] = $newrats . " ratifiche inserite";
        if ($updated > 0) $output[] = $updated . " alumni aggiornati";
        if ($rejected > 0) $output[] = $rejected . " ratifiche già presenti";
        if ($already > 0) $output[] = $already . " stati già assegnati";

        $type = ( $rejected + $already ) > 0 ? 'warning' : 'success';

        return redirect()->back()->with('notistack', [$type, implode(', ', $output)]);
    }

    public function delete_post(Request $request, Ratification $rat)
    {
        $this->authorize('view', Ratification::class);

        $rat->delete();

        return redirect()->back();
    }

    public function export(Request $request)
    {
        $this->authorize('view', Ratification::class);

        $rats = Ratification::whereNull('document_id')->with('alumnus')->get()
            ->sortBy(function ($rat, $key) {
                return str_pad($rat->coorte, 4, STR_PAD_LEFT) . " " . $rat->alumnus->surname . " " . $rat->alumnus->name;
            });

        $rats_entering = array_fill_keys( Alumnus::require_ratification, [] );
        $rats_exiting = array_fill_keys( Alumnus::require_ratification, [] );
        $rats_changing = array_fill_keys( Alumnus::require_ratification, array_fill_keys( Alumnus::require_ratification, [] ) );
        $rats_extra = [];

        foreach ($rats as $rat) {
            if( in_array( $rat->required_state, Alumnus::require_ratification ) ) {
                if( in_array( $rat->alumnus->status, Alumnus::require_ratification ) ) {
                    $rats_changing[ $rat->alumnus->status ][ $rat->required_state ][] = $rat;
                }
                else {
                    $rats_entering[ $rat->required_state ][] = $rat;
                }
            } elseif( in_array( $rat->alumnus->status, Alumnus::require_ratification ) ) {
                $rats_exiting[ $rat->alumnus->status ][] = $rat;
            } else {
                $rats_extra[] = $rat;
            }
        }

        $pdf = new TemplatedPdfGenerator();

        $pdf->SetTitle('Lista delle richieste di ratifica');
        $pdf->SetAuthor(Auth::user()->identity->surnameAndName());

        $pdf->AddPage();

        $pdf->spacing(4);
        $pdf->HTMLhere('Al consiglio di Amministrazione', 'R');
        $pdf->spacing(2);

        $pdf->HTMLhere('<b>Oggetto:</b> richieste di ratifica di nuovo stato associativo');
        $pdf->spacing(2);

        $pdf->HTMLhere('In data ' . date('d/m/Y') . " sono presenti nel Portale Soci dell'Associazione Alumni della Scuola Galileiana le seguenti richieste di ratifica per il cambio di stato associativo:\n");
        $pdf->spacing();

        // Iscrizioni al libro dei soci
        foreach ($rats_entering as $k => $v) {
            if( count($v) == 0 ) continue;

            $pdf->HTMLenqueue('Richiedono l\'iscrizione allo stato di <i>' . Alumnus::AlumnusStatusLabels[$k] . '</i> (' . count($v) . '):');

            $pdf->HTMLenqueue('<ul>');
            foreach ($v as $a) {
                $pdf->HTMLenqueue("<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . ")</li>");
            }
            $pdf->HTMLenqueue("</ul>");
            $pdf->HTMLenqueue("<br />");
        }

        // Spostamenti nel libro dei soci
        foreach ($rats_changing as $k_from => $vs) {
            foreach( $vs as $k_to => $v ) {
                if( count($v) == 0 ) continue;

                $pdf->HTMLenqueue('Richiedono il passaggio dallo stato di <i>' . Alumnus::AlumnusStatusLabels[$k_from] . '</i> allo stato di <i>' . Alumnus::AlumnusStatusLabels[$k_to] . '</i> (' . count($v) . '):');
    
                $pdf->HTMLenqueue('<ul>');
                foreach ($v as $a) {
                    $pdf->HTMLenqueue("<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . ")</li>");
                }
                $pdf->HTMLenqueue("</ul>");
                $pdf->HTMLenqueue("<br />");
            }
        }

        // Rimorzioni dal libro dei soci
        foreach ($rats_exiting as $k => $v) {
            if( count($v) == 0 ) continue;

            $pdf->HTMLenqueue('Richiedono la rimozione dallo stato di <i>' . Alumnus::AlumnusStatusLabels[$k] . '</i> (' . count($v) . '):');

            $pdf->HTMLenqueue('<ul>');
            foreach ($v as $a) {
                $pdf->HTMLenqueue("<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . ")</li>");
            }
            $pdf->HTMLenqueue("</ul>");
            $pdf->HTMLenqueue("<br />");
        }

        // Altro
        if( count( $rats_extra ) > 0 ) {
            $pdf->HTMLenqueue('Inoltre, vengono riportati all\'attenzione del Consiglio i seguenti casi (' . count($rats_extra) . '):');

            $pdf->HTMLenqueue('<ul>');
            foreach ($rats_extra as $a) {
                $pdf->HTMLenqueue("<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . "), dallo stato di <i>" . Alumnus::AlumnusStatusLabels[$a->alumnus->status] . "</i> allo stato di <i>" . Alumnus::AlumnusStatusLabels[$a->required_state]  . "</i></li>");
            }
            $pdf->HTMLenqueue("</ul>");
            $pdf->HTMLenqueue("<br />");
        }


        $pdf->HTMLenqueue("Padova, " . date('d/m/Y'));
        $pdf->HTMLenqueue("<br />");
        $pdf->HTMLenqueue("<small>Documento generato automaticamente dal Portale Soci dell'Associazione Alumni Scuola Galileiana</small>");

        $pdf->HTMLflush();
        $pdf->spacing();

        LogController::log(LogEvents::DOWNLOADED_RATIFICATIONSLIST);

        $pdf->Output('Ratifications.pdf', 'I');
        exit;
    }
}
