<?php

namespace App\Http\Controllers;

use App\Models\DynamicPermission;
use App\Models\File;
use App\Models\MailingList;
use App\Models\Permalink;
use App\Models\Resource;
use App\Policies\FilePolicy;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx\Rels;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use SplFileObject;

class MailingListController extends Controller
{
    public function list()
    {
        // No authorization: visible by anyone
        $params = [];

        $params['list'] = MailingList::with(['dynamicPermissions', 'dynamicPermissions.role'])->get()
            ->filter->canView->values();

        $params['canCreate'] = Auth::check() && Auth::user()->can('create', MailingList::class);

        return Inertia::render('Mailinglist/List', $params);
    }

    public function edit(Request $request, ?MailingList $ml = null)
    {
        if ($ml)
            $this->authorize('edit', $ml);
        else
            $this->authorize('create', MailingList::class);

        if ($ml)
            $ml->load(['dynamicPermissions', 'dynamicPermissions.role']);

        $roles = Role::orderBy('id')->get();

        // Log::channel('flask')->info($ml);
        // throw new Exception();

        return Inertia::render('Mailinglist/Edit', [
            'mailinglist' => $ml,
            'roles' => $roles,
        ]);
    }

    public function edit_post(Request $request, ?MailingList $ml = null)
    {
        if ($ml)
            $this->authorize('edit', $ml);
        else
            $this->authorize('create', MailingList::class);

        $validated = $request->validate([
            'name' => 'required|string|min:3',
            'list' => 'sometimes|mimes:xlsx|nullable',
            'canView' => 'required|array|min:1',
            'canView.*' => 'integer|exists:roles,id',
            'canEdit' => 'required|array|min:1',
            'canEdit.*' => 'integer|exists:roles,id',
        ]);

        $new = false;
        if (!$ml) {
            $ml = new MailingList();
            $new = true;
            $ml->count = 0;
        }

        $ml->name = $validated['name'];
        $ml->save();

        $ml->load(['dynamicPermissions', 'dynamicPermissions.role']);

        // Check the view roles
        $current_roles = $ml->dynamicPermissions
            ->filter(function ($dp) {
                return $dp->type == 'view';
            })
            ->pluck('role_id')->toArray();
        foreach (array_diff($current_roles, $validated['canView']) as $role) {
            // Roles to remove
            $dynamicPermission = $ml->dynamicPermissions()
                ->where('role_id', $role)->where('type', 'view')->get();
            foreach ($dynamicPermission as $dp) {
                $dp->delete();
            }
        }
        foreach (array_diff($validated['canView'], $current_roles) as $role) {
            // Roles to add
            $dynamicPermission = DynamicPermission::createFromRelations(
                'view',
                $ml,
                Role::findById($role)
            );
        }

        // Check the edit roles
        $current_roles = $ml->dynamicPermissions
            ->filter(function ($dp) {
                return $dp->type == 'edit';
            })
            ->pluck('role_id')->toArray();
        foreach (array_diff($current_roles, $validated['canEdit']) as $role) {
            // Roles to remove
            $dynamicPermission = $ml->dynamicPermissions()
                ->where('role_id', $role)->where('type', 'edit')->get();
            foreach ($dynamicPermission as $dp) {
                $dp->delete();
            }
        }
        foreach (array_diff($validated['canEdit'], $current_roles) as $role) {
            // Roles to add
            $dynamicPermission = DynamicPermission::createFromRelations(
                'edit',
                $ml,
                Role::findById($role)
            );
        }

        $count = 0;
        $errors = "";
        // Update the list from excel
        if (array_key_exists('list', $validated) && $validated['list']) {

            // Load file
            $spreadsheet = IOFactory::load($validated['list']);
            $sheet = $spreadsheet->getActiveSheet();

            // Open csv
            $filename = $ml->getFilename();
            $outfile = new SplFileObject(storage_path() . $filename, 'w');

            for ($i = 0; $i < $sheet->getHighestRow(); $i++) {
                $addr = trim($sheet->getCell([1, $i + 1]));

                if (strlen($addr) == 0) continue;

                if (filter_var($addr, FILTER_VALIDATE_EMAIL)) {
                    $outfile->fwrite($addr . "\n");
                    $count++;
                } else {
                    $errors .= $addr . ",";
                }
            }

            $ml->count = $count;
            $ml->save();
        }

        $out = redirect()->route('mailinglist')->with('notistack', ['success', $new ? 'Nuova lista creata' : 'Lista aggiornata']);
        if (strlen($errors) > 0)
            $out->with('errorsDialogs', ['I seguenti indirizzi sono stati ignorati in quanto non compatibili: ' . $errors]);

        return $out;
    }

    public function download(Request $request, ?MailingList $ml = null)
    {
        if ($ml)
            $this->authorize('edit', $ml);
        else
            $this->authorize('create', MailingList::class);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        if ($ml) {
            $filename = $ml->getFilename();
            if (file_exists(storage_path() . $filename)) {

                $row = 0;
                foreach (new SplFileObject(storage_path() . $filename) as $line) {
                    if (strlen(trim($line))) {
                        $row++;
                        $sheet->getCell([1, $row])->setValue(trim($line));
                    }
                }
            }
        }

        // Output
        $writer = new Xlsx($spreadsheet);
        $writer->setPreCalculateFormulas(false);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'mailinglist_' . ($ml ? $ml->id : 'new') . "_" . ($ml ? $ml->name : 'unnamed') . "_" . date('Ymd') . '_' . env('APP_ENV', 'debug') .  '.xlsx');
    }
}
