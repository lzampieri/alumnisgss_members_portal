<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AlumnusController extends Controller
{
    public function membersList()
    {
        $this->authorize('viewMembers', Alumnus::class);
        $members = Alumnus::where('status', Alumnus::Member)->orWhere('status', Alumnus::StudentMember)->orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Members/List', ['members' => $members]);
    }

    public function list()
    {
        $this->authorize('viewAny', Alumnus::class);
        $alumni = Alumnus::orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Registry/List', ['alumni' => $alumni, 'canImport' => Auth::user()->can('bulkEdit', Alumnus::class)]);
    }

    public function add()
    {
        $this->authorize('edit', Alumnus::class);

        return Inertia::render('Registry/Add', ['availableStatus' => Alumnus::status ]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('edit', Alumnus::class);

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'coorte' => 'required|numeric',
            'status' => 'required|in:' . implode(',',Alumnus::status )
        ]);

        Alumnus::create($validated);
        Log::debug('Alumnus created', $validated);

        return redirect()->route('registry')->with('notistack', ['success', 'Inserimento riuscito']);
    }

    public function bulk_im()
    {
        $this->authorize('bulkEdit', Alumnus::class);

        return Inertia::render('Registry/Bulk');
    }

    public function bulk_im_post(Request $request)
    {
        $this->authorize('bulkEdit', Alumnus::class);

        $content = preg_split("/\r\n|\n|\r/", $request->input('content'));

        $count = 0;
        foreach ($content as $line) {
            if (strlen($line) < 3) continue;
            $fields = explode(',', $line);
            if (count($fields) != 4) continue;
            if (!is_numeric($fields[2])) continue;
            if (!in_array($fields[3],Alumnus::status)) continue;

            $data = [
                'surname' => $fields[0],
                'name' => $fields[1],
                'coorte' => $fields[2],
                'status' => $fields[3]
            ];

            Alumnus::create($data);
            Log::debug('Alumnus created from bulk', $data);
            $count++;
        }

        return redirect()->route('registry')->with('notistack', ['success', 'Anagrafiche inserite: ' . $count]);
    }

    public function bulk_ex()
    {
        $this->authorize('bulkEdit', Alumnus::class);

        return response()->streamDownload( function() {
            echo "\xEF\xBB\xBF"; // UTF-8 BOM
            $alumni = Alumnus::all();
            foreach( $alumni as $a )
                echo implode( ',', [ $a->name, $a->surname, $a->coorte, $a->status ] ) . "\n";
        }, 'export_' . date('Ymd') . '_' . env('APP_ENV','debug') .  '.csv' );
    }

    public function edit(Request $request, Alumnus $alumnus)
    {
        $this->authorize('edit', Alumnus::class);

        return Inertia::render('Registry/Edit', ['alumnus' => $alumnus, 'availableStatus' => Alumnus::status ]);
    }

    public function edit_post(Request $request, Alumnus $alumnus)
    {
        $this->authorize('edit', Alumnus::class);

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'coorte' => 'required|numeric',
            'status' => 'required|in:' . implode(',',Alumnus::status )
        ]);

        $alumnus->update($validated);
        Log::debug('Alumnus updated', $validated);

        return redirect()->route('registry')->with('notistack', ['success', 'Aggiornamento riuscito']);
    }
}
