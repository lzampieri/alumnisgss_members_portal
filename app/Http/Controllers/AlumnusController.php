<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\IdentityDetail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AlumnusController extends Controller
{
    public function membersList()
    {
        $this->authorize('viewMembers', Alumnus::class);
        $members = Alumnus::whereIn('status', Alumnus::public_status)->orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Members/List', ['members' => $members]);
    }

    public function membersCounters()
    {
        $this->authorize('viewMembers', Alumnus::class);
        $members = Alumnus::where('status', 'member')->count();
        $students = Alumnus::where('status', 'student_member')->count();

        return response()->json([
            'members' => $members,
            'student_members' => $students
        ]);
    }

    public function list()
    {
        $this->authorize('viewAny', Alumnus::class);
        $alumni = Alumnus::withCount(['ratifications' => function (Builder $query) {
            $query->whereNull('document_id');
        }])->orderBy('surname')->orderBy('name')->get();

        return Inertia::render('Registry/List', ['alumni' => $alumni, 'canImport' => Auth::user()->can('import', Alumnus::class)]);
    }

    public function edit(Request $request, ?Alumnus $alumnus = null)
    {
        $this->authorize('edit', Alumnus::class);
        
        if( $alumnus )
            $alumnus->load(['details', 'ratifications', 'ratifications.document']);

        return Inertia::render('Registry/Edit', [
            'alumnus' => $alumnus,
            'availableStatus' => Alumnus::availableStatus($alumnus),
            'allTags' => Alumnus::allTags(),
            'allDetails' => IdentityDetail::allDetails()
        ]);
    }

    public function edit_post(Request $request, ?Alumnus $alumnus = null)
    {
        $this->authorize('edit', Alumnus::class);
        $update = false;

        $validated = $request->validate([
            'surname' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'name' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'coorte' => 'required|numeric',
            'status' => 'required|in:' . implode(',', Alumnus::availableStatus($alumnus)),
            'tags' => 'nullable|array',
            'details' => 'nullable|array',
            'details.*' => 'nullable|array',
            'details.*.delete' => 'nullable|boolean',
            'details.*.key' => 'exclude_if:details.*.delete,true|required|min:3|max:200',
            'details.*.value' => 'exclude_if:details.*.delete,true|nullable',
        ]);

        if( $alumnus ) {

            $alumnus->update($validated);
            Log::debug('Alumnus updated', $validated);
            $update = true;
            
        }
        else { 

            $alumnus = Alumnus::create($validated);
            Log::debug('Alumnus created', $validated);
        }

        foreach( $validated['details'] as $detail ) {
            if( array_key_exists( 'id', $detail ) && $detail['id'] >= 0 ) {
                $det = IdentityDetail::find( $detail['id'] );

                // Details already exists; check if to delete)
                if( array_key_exists( 'delete', $detail ) && $detail['delete'] ) {
                    Log::debug("Deleted detail", $detail);
                    $det->delete();
                } else {
                    // Update if necessary
                    if( $det->key != $detail['key'] || $det->value != $detail['value'] ) {
                        $det->update( [ 'key' => $detail['key'], 'value' => $detail['value'] ] );
                        Log::debug("Updated detail", $detail);
                    }
                }
            }
            else {
                // New details must be created
                if( !array_key_exists( 'delete', $detail ) || !$detail['delete'] ) {
                    $alumnus->details()->create([ 'key' => $detail['key'], 'value' => $detail['value'] ] );
                    Log::debug("New detail created", $detail);
                }
            }
        }
        
        if( $update ) return redirect()->route('registry')->with('notistack', ['success', 'Aggiornamento riuscito']);
        return redirect()->route('registry')->with('notistack', ['success', 'Inserimento riuscito']);
    }
    
    // public function bulk_edit()
    // {
    //     $this->authorize('bulkEdit', Alumnus::class);

    //     return Inertia::render('Registry/BulkEdit', [
    //         'alumni' => Alumnus::all(),
    //         'availableStatus' => Alumnus::availableStatus(),
    //     ]);
    // }

    // public function bulk_edit_post(Request $request)
    // {
    //     $this->authorize('bulkEdit', Alumnus::class);

    //     $validated = $request->validate([
    //         'alumni_id' => 'required|array',
    //         'alumni_id.*' => 'exists:alumni,id',
    //         'new_state' => 'required|in:' . implode(',', Alumnus::availableStatus())
    //     ]);

    //     $edited = 0;
    //     $toUpdate = Alumnus::whereIn('id', $validated['alumni_id'])->get();

    //     foreach ($toUpdate as $alumnus) {
    //         if ($alumnus->status != $validated['new_state']) {
    //             $edited++;
    //             Log::debug('Alumnus status edited (bulk)', ['alumnus' => $alumnus, 'new_state' => $validated['new_state']]);
    //             $alumnus->status = $validated['new_state'];
    //             $alumnus->save();
    //         }
    //     }

    //     $output = "" . $edited . " su " . count($toUpdate) . " stati modificati";

    //     return redirect()->route('registry.bulk.edit')->with('notistack', ['success', $output]);
    // }
}
