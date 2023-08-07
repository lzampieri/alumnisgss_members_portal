<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
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

        return Inertia::render('Registry/List', ['alumni' => $alumni, 'canEditBulk' => Auth::user()->can('bulkEdit', Alumnus::class)]);
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
            'status' => 'required|in:' . implode(',', Alumnus::availableStatus())
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

    public function bulk_ex_csv()
    {
        $this->authorize('bulkEdit', Alumnus::class);

        return response()->streamDownload(function () {
            echo "\xEF\xBB\xBF"; // UTF-8 BOM
            $alumni = Alumnus::all();
            foreach ($alumni as $a)
                echo implode(',', [$a->name, $a->surname, $a->coorte, $a->status]) . "\n";
        }, 'export_' . date('Ymd') . '_' . env('APP_ENV', 'debug') .  '.csv');
    }

    public function bulk_ex_xls()
    {
        $this->authorize('bulkEdit', Alumnus::class);

        $alumni = Alumnus::orderBy('surname')->orderBy('name')->get()->groupBy('coorte');
        $coorts = $alumni->keys()->sort()->values();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $verticalOffset = 4;
        $horizontalOffset = 2;

        $titleStyle = [
            'font' => ['bold' => true,'size' => 26]
        ];
        $columnHeaderStyle = [
            'font' => ['bold' => true,],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FFCC00']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN
                ]
            ],
            'alignment' => [ 'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER ],
        ];
        $alumnusStyle = function ($a) {
            return [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => Alumnus::AlumnusStatusColors[$a->status]]
                ],
                'alignment' => [ 'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER ],
            ];
        };
        $legendStyle = function ($status) {
            return [
                'font' => [ 'italic' => true ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => Alumnus::AlumnusStatusColors[$status]]
                ]
            ];
        };

        $max_alumnus = 0;

        foreach ($coorts as $coort_i => $coort) {
            $column = Coordinate::stringFromColumnIndex($horizontalOffset + $coort_i);

            $sheet->setCellValue($column . $verticalOffset, Alumnus::romanize($coort));
            $sheet->getStyle($column . $verticalOffset)->applyFromArray($columnHeaderStyle);
            $sheet->getColumnDimension($column)->setWidth(23);

            foreach ($alumni[$coort] as $alumnus_i => $alumnus) {
                $sheet->setCellValue($column . ($verticalOffset + $alumnus_i + 1), $alumnus->surnameAndName());
                $sheet->getStyle($column . ($verticalOffset + $alumnus_i + 1))->applyFromArray($alumnusStyle($alumnus));
            }

            $max_alumnus = max( $max_alumnus, count( $alumni[$coort] ) );
        }

        $sheet->getColumnDimension('A')->setWidth(23);
        for( $i = 0; $i < $max_alumnus; $i++ )
            $sheet->setCellValue( 'A' . ( $verticalOffset + $i + 1 ), $i + 1 );
            
        $i = $max_alumnus + 2;
        foreach( Alumnus::AlumnusStatusLabels as $key => $label ) {
            $sheet->setCellValue( 'A' . ( $verticalOffset + $i ), $label );
            $sheet->getStyle('A' . ( $verticalOffset + $i ))->applyFromArray($legendStyle($key));
            $i++;
        }

        $sheet->setCellValue( 'B1', "Soci" );
        $sheet->getStyle('B1')->applyFromArray($titleStyle);
        $sheet->getRowDimension(1)->setRowHeight(34);

        $sheet->setCellValue( 'B2', "Report generato il " . date('d/m/Y') . " da " . Auth::user()->identity->surnameAndName() . " tramite il portale soci." );

        $sheet->freezePane('B1');

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'export_' . date('Ymd') . '_' . env('APP_ENV', 'debug') .  '.xlsx');
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
            'new_state' => 'required|in:' . implode(',', Alumnus::availableStatus())
        ]);

        $edited = 0;
        $toUpdate = Alumnus::whereIn('id', $validated['alumni_id'])->get();

        foreach ($toUpdate as $alumnus) {
            if ($alumnus->status != $validated['new_state']) {
                $edited++;
                Log::debug('Alumnus status edited (bulk)', ['alumnus' => $alumnus, 'new_state' => $validated['new_state']]);
                $alumnus->status = $validated['new_state'];
                $alumnus->save();
            }
        }

        $output = "" . $edited . " su " . count($toUpdate) . " stati modificati";

        return redirect()->route('registry.bulk.edit')->with('notistack', ['success', $output]);
    }
}
