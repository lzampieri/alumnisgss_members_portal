<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AlumnusController extends Controller
{
    public function membersList()
    {
        $this->authorize('viewMembers', Alumnus::class);
        $members = Alumnus::whereIn('status', Alumnus::public_status)->orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Members/List', ['members' => $members]);
    }

    public function list()
    {
        $this->authorize('viewAny', Alumnus::class);
        $alumni = Alumnus::withCount(['ratifications'=> function (Builder $query) { $query->whereNull('document_id'); }])->orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Registry/List', ['alumni' => $alumni, 'canImport' => Auth::user()->can('bulkEdit', Alumnus::class)]);
    }

    public function add()
    {
        $this->authorize('edit', Alumnus::class);

        return Inertia::render('Registry/Add', ['availableStatus' => Alumnus::availableStatus()]);
    }

    public function add_post(Request $request)
    {
        $this->authorize('edit', Alumnus::class);

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'coorte' => 'required|numeric',
            'status' => 'required|in:' . implode(',', Alumnus::availableStatus() )
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
            if (!in_array($fields[3], Alumnus::availableStatus())) continue;

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

        return response()->streamDownload(function () {
            echo "\xEF\xBB\xBF"; // UTF-8 BOM
            $alumni = Alumnus::all();
            foreach ($alumni as $a)
                echo implode(',', [$a->name, $a->surname, $a->coorte, $a->status]) . "\n";
        }, 'export_' . date('Ymd') . '_' . env('APP_ENV', 'debug') .  '.csv');
    }

    public function edit(Request $request, Alumnus $alumnus)
    {
        $this->authorize('edit', Alumnus::class);

        return Inertia::render('Registry/Edit', ['alumnus' => $alumnus, 'availableStatus' => Alumnus::availableStatus($alumnus)]);
    }

    public function edit_post(Request $request, Alumnus $alumnus)
    {
        $this->authorize('edit', Alumnus::class);

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s]+$/',
            'coorte' => 'required|numeric',
            'status' => 'required|in:' . implode(',', Alumnus::availableStatus($alumnus))
        ]);

        $alumnus->update($validated);
        Log::debug('Alumnus updated', $validated);

        return redirect()->route('registry')->with('notistack', ['success', 'Aggiornamento riuscito']);
    }

    
    public function bulk_edit()
    {
        $this->authorize('bulkEdit', Alumnus::class);

        return Inertia::render('Registry/BulkEdit', [
            'alumni' => Alumnus::all(),
            'availableStatus' => Alumnus::availableStatus(),
        ]);
    }

    public function bulk_edit_post(Request $request)
    {
        $this->authorize('bulkEdit', Alumnus::class);

        $validated = $request->validate([
            'alumni_id' => 'required|array',
            'alumni_id.*' => 'exists:alumni,id',
            'new_state' => 'required|in:' . implode(',', Alumnus::availableStatus() )
        ]);

        $edited = 0;
        $toUpdate = Alumnus::whereIn('id', $validated['alumni_id'])->get();

        foreach( $toUpdate as $alumnus ) {
            if( $alumnus->status != $validated['new_state'] ) {
                $edited++;
                Log::debug('Alumnus status edited (bulk)', ['alumnus'=>$alumnus, 'new_state' => $validated['new_state']]);
                $alumnus->status = $validated['new_state'];
                $alumnus->save();
            }
        }

        $output = "" . $edited . " su " . count( $toUpdate ) . " stati modificati";

        return redirect()->route('registry.bulk.edit')->with('notistack', ['success', $output]);
    }
}
