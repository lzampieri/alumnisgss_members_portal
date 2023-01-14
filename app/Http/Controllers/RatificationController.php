<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
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
            'rats' => Ratification::with('alumnus')->get()->groupBy('required_state')
        ]);
    }


    public function add()
    {
        $this->authorize('edit', Ratification::class);

        return Inertia::render('Ratifications/Add', [
            'alumni' => Alumnus::with('ratifications')->get(),
            'possibleStatus' => Alumnus::require_ratification
        ]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('edit', Ratification::class);

        $validated = $request->validate([
            'alumnus_id' => 'required|exists:alumni,id',
            'required_state' => 'required|in:' . implode(',', Alumnus::require_ratification)
        ]);

        Ratification::create($validated);
        Log::debug('Ratification created', $validated);

        return redirect()->route('ratifications')->with('notistack', ['success', 'Inserimento riuscito']);
    }

    public function delete_post(Request $request, Ratification $rat)
    {
        $this->authorize('view', Ratification::class);

        Log::debug('Ratification deleted', $rat);
        $rat->delete();

        return redirect()->back();
    }

    public function export(Request $request)
    {
        $this->authorize('view', Ratification::class);

        $rats = Ratification::with('alumnus')->get()->groupBy('required_state');

        $pdf = new TemplatedPdfGenerator();

        $pdf->SetTitle('Lista delle richieste di ratifica');
        $pdf->SetAuthor(Auth::user()->identity->surnameAndName());

        $pdf->AddPage();

        $pdf->spacing(4);
        $pdf->HTMLhere( 'Al consiglio di Amministrazione', 'R');
        $pdf->spacing(2);

        $pdf->HTMLhere('<b>Oggetto:</b> richieste di ratifica di nuovo stato associativo');
        $pdf->spacing(2);

        $pdf->HTMLhere( 'In data ' . date('d/m/Y') . " sono presenti nel Portale Soci dell'Associazione Alumni della Scuola Galileiana le seguenti richieste di ratifica per il cambio di stato associativo:\n");
        $pdf->spacing();

        foreach ($rats as $k => $v) {
            $pdf->HTMLhere('Richiedono il passaggio allo stato di <i>' . Alumnus::AlumnusStatusLabels[$k] . '</i>');

            $pdf->HTMLenqueue( '<ul>' );
            foreach ($v as $a) {
                $pdf->HTMLenqueue( "<li>" . $a->alumnus->surname . " " . $a->alumnus->name . " (" . Alumnus::romanize($a->alumnus->coorte) . ")</li>" );
            }
            $pdf->HTMLenqueue( "</ul>" );

            $pdf->HTMLflush();
            $pdf->spacing();
        }

        Log::debug('Ratifications summary generated');

        $pdf->Output('Ratifications.pdf', 'I');
        exit;
    }
}
