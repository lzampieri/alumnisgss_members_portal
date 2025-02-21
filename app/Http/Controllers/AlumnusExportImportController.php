<?php

namespace App\Http\Controllers;

use App\Models\ADetail;
use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\IdentityDetail;
use App\Models\Ratification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AlumnusExportImportController extends Controller
{
    public function exportExcelSchema()
    {
        $this->authorize('viewAny', Alumnus::class);

        LogController::log(LogEvents::DOWNLOADED_SCHEMA);

        $alumni = Alumnus::orderBy('surname')->orderBy('name')->get()->groupBy('coorte');
        $coorts = $alumni->keys()->sort()->values();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $verticalOffset = 4;
        $horizontalOffset = 2;

        $titleStyle = [
            'font' => ['bold' => true, 'size' => 26]
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
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
        ];
        $alumnusStyle = function ($a) {
            return [
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => Alumnus::AlumnusStatusColors[$a->status]]
                ],
                'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            ];
        };
        $legendStyle = function ($status) {
            return [
                'font' => ['italic' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => Alumnus::AlumnusStatusColors[$status]]
                ]
            ];
        };

        $max_alumnus = 0;

        $counts = [];

        foreach ($coorts as $coort_i => $coort) {
            $counts[$coort_i] = ['total' => 0]; // Stats for the last rows

            $column = Coordinate::stringFromColumnIndex($horizontalOffset + $coort_i);

            $sheet->setCellValue($column . $verticalOffset, Alumnus::romanize($coort));
            $sheet->getStyle($column . $verticalOffset)->applyFromArray($columnHeaderStyle);
            $sheet->getColumnDimension($column)->setWidth(23);

            foreach ($alumni[$coort] as $alumnus_i => $alumnus) {
                $sheet->setCellValue($column . ($verticalOffset + $alumnus_i + 1), $alumnus->surnameAndName());
                $sheet->getStyle($column . ($verticalOffset + $alumnus_i + 1))->applyFromArray($alumnusStyle($alumnus));

                if (array_key_exists($alumnus->status, $counts[$coort_i])) $counts[$coort_i][$alumnus->status]++;
                else $counts[$coort_i][$alumnus->status] = 1;

                $counts[$coort_i]['total']++;
            }

            $max_alumnus = max($max_alumnus, count($alumni[$coort]));
        }

        $sheet->getColumnDimension('A')->setWidth(23);
        for ($i = 0; $i < $max_alumnus; $i++)
            $sheet->setCellValue('A' . ($verticalOffset + $i + 1), $i + 1);

        $i = $max_alumnus + 2;
        foreach (Alumnus::AlumnusStatusLabels as $key => $label) {
            $sheet->setCellValue('A' . ($verticalOffset + $i), $label);
            $sheet->getStyle('A' . ($verticalOffset + $i))->applyFromArray($legendStyle($key));

            foreach ($coorts as $coort_i => $coort) {
                $column = Coordinate::stringFromColumnIndex($horizontalOffset + $coort_i);
                $sheet->setCellValue(
                    $column . ($verticalOffset + $i),
                    array_key_exists($key, $counts[$coort_i]) ? $counts[$coort_i][$key] : 0
                );
            }

            $i++;
        }

        // Totale
        $sheet->setCellValue('A' . ($verticalOffset + $i), 'Totale');
        foreach ($coorts as $coort_i => $coort) {
            $column = Coordinate::stringFromColumnIndex($horizontalOffset + $coort_i);
            $sheet->setCellValue($column . ($verticalOffset + $i), $counts[$coort_i]['total']);
        }


        $sheet->setCellValue('B1', "Soci");
        $sheet->getStyle('B1')->applyFromArray($titleStyle);
        $sheet->getRowDimension(1)->setRowHeight(34);

        $sheet->setCellValue('B2', "Report generato il " . date('d/m/Y') . " da " . Auth::user()->identity->surnameAndName() . " tramite il portale soci.");

        $sheet->freezePane('B1');

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'export_' . date('Ymd') . '_' . env('APP_ENV', 'debug') .  '.xlsx');
    }

    private function writeXY($sheet, $column, $row, $text, $style = [])
    {
        $col = Coordinate::stringFromColumnIndex($column);
        $sheet->setCellValue($col . $row, $text);

        if (count($style) > 0)
            $sheet->getStyle($col . $row)->applyFromArray($style);
    }

    public function exportExcelDetails()
    {
        $this->authorize('viewAny', Alumnus::class);
        LogController::log(LogEvents::DOWNLOADED_DETAILS);

        $alumni = Alumnus::orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->with(['aDetails' => function ($query) {
                $query->whereHas('aDetailsType', function ($query) {
                    $query->where('visible', true);
                })->orderBy(ADetailsType::select('order')->whereColumn('a_details_types.id', 'a_details.a_details_type_id'));
            }, 'aDetails.aDetailsType'])
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->append('a_details_keyd');
        $adtlist = ADetailsType::allOrdered();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', "Soci - Lista dettagliata");
        $sheet->getStyle('A1')->applyFromArray(['font' => ['bold' => true, 'size' => 26]]);
        $sheet->getRowDimension(1)->setRowHeight(34);

        $sheet->setCellValue('A2', "Report generato il " . date('d/m/Y') . " da " . Auth::user()->identity->surnameAndName() . " tramite il portale soci.");
        $sheet->getStyle('A2')->applyFromArray(['font' => ['bold' => true]]);

        $sheet->setCellValue('A3', "Attenzione: il contenuto di questo report è altamente riservato. Si prega di non divulgarlo e conservarlo solo per il tempo necessario.");
        $sheet->getStyle('A3')->applyFromArray(['font' => ['bold' => true, 'color' => ['argb' => 'FF0000']]]);

        $sheet->setCellValue('A4', "Per motivi di sicurezza, il download di questo file è registrato assieme alle credenziali di accesso.");
        $sheet->getStyle('A4')->applyFromArray(['font' => ['bold' => true, 'color' => ['argb' => 'FF0000']]]);

        $titles = ['ID', 'Cognome', 'Nome', 'Coorte', 'Stato', 'Tags'];
        $keys   = ['id', 'surname', 'name', 'coorte', 'status', 'tags'];

        foreach ($titles as $col => $title) {
            $this->writeXY($sheet, $col + 1, 6, $title, ['font' => ['bold' => true]]);
            if ($col > 0)
                $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($col + 1))->setWidth(15);
            else
                $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($col + 1))->setWidth(4);
        }

        $cumcolindex = [];
        foreach ($adtlist as $col => $adt) {
            $cumcol = count($titles) + 2 * $col + 1;
            $cumcolindex[$adt->id] = $cumcol;
            $this->writeXY($sheet, $cumcol, 6, $adt->id);
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($cumcol))->setWidth(4);
            $this->writeXY($sheet, $cumcol + 1, 6, $adt->name, ['font' => ['bold' => true]]);
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($cumcol + 1))->setWidth(30);
        }

        foreach ($alumni as $i => $alumnus) {
            foreach ($keys as $col => $key) {
                $content = $alumnus[$key];
                if ($key == 'status')
                    $content = Alumnus::AlumnusStatusLabels[$content];
                if (is_array($content))
                    $content = implode('; ', $content);

                $this->writeXY($sheet, $col + 1, $i + 7, $content);
            }
            foreach ($alumnus->aDetails as $adt) {
                $cumcol = $cumcolindex[$adt->a_details_type_id];
                $this->writeXY($sheet, $cumcol, $i + 7, $adt->id);
                if (count($adt->value) == 1)
                    $this->writeXY($sheet, $cumcol + 1, $i + 7, $adt->value[0]);
                elseif (count($adt->value) > 1)
                    $this->writeXY($sheet, $cumcol + 1, $i + 7, json_encode($adt->value));
            }
        }

        // Locking some cells
        $spreadsheet->getActiveSheet()->getProtection()->setSheet(true);
        $spreadsheet->getActiveSheet()->getProtection()->setSort(false);
        $spreadsheet->getActiveSheet()->getProtection()->setAutoFilter(false);
        $spreadsheet->getDefaultStyle()->getProtection()->setLocked(false);
        $sheet->getStyle('1:6')->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        $sheet->getStyle('A:A')->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        foreach ($cumcolindex as $key => $col) {
            $col_str = Coordinate::stringFromColumnIndex($col);
            $sheet->getStyle($col_str . ':' . $col_str)->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        }
        $last_col = Coordinate::stringFromColumnIndex(count($titles) + 2 * count($cumcolindex) + 1);
        $sheet->getStyle($last_col . ':XFD')->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        $sheet->getStyle((count($alumni) + 7) . ':' . (count($alumni) + 700))->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);

        // Layout stuff:
        // - locking first 6 rows
        $sheet->freezePane('A7');
        // - enabling filters
        $spreadsheet->getActiveSheet()->setAutoFilter('A6:' . Coordinate::stringFromColumnIndex(count($titles) + count($adtlist) * 2) . '7');
        $spreadsheet->getActiveSheet()->getAutoFilter()->setRangeToMaxRow();

        // Output
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'detailedexport_' . date('Ymd') . '_' . env('APP_ENV', 'debug') .  '.xlsx');
    }

    public function importExcelDetails()
    {
        $this->authorize('import', Alumnus::class);

        return Inertia::render('Registry_ImpExp/ImportDetails');
    }

    public function importExcelDetails_post(Request $request)
    {
        $this->authorize('import', Alumnus::class);
        $output = "";

        $validated = $request->validate([
            'file' => 'required|mimes:xlsx',
        ]);

        // Load file
        $spreadsheet = IOFactory::load($validated['file']);
        $sheet = $spreadsheet->getActiveSheet();

        // Checking compatibility: title
        $title = $sheet->getCellByColumnAndRow(1, 1)->getValue();
        if ($title != "Soci - Lista dettagliata")
            return redirect()->back()->with('notistack', ['error', "File non compatibile."]);

        // Check compatibility: length
        $alumnusNumber = $sheet->getHighestRow() - 6;
        if ($alumnusNumber < 1)
            return redirect()->back()->with('notistack', ['error', "Nessun alumno nella lista."]);
        $columnsNumber = Coordinate::columnIndexFromString($sheet->getHighestColumn());
        if ($columnsNumber < 6)
            return redirect()->back()->with('notistack', ['error', "File non compatibile."]);

        // Standard fields
        $stdkeys   = ['id', 'surname', 'name', 'coorte', 'status', 'tags'];

        // Compute the adetails dictionary
        $adtlist = ADetailsType::allOrdered()->keyBy('id')->toArray();

        // Associate adetails to columns
        $titles = $sheet->rangeToArray("G6:" . $sheet->getHighestColumn() . "6")[0];
        $adtcols = [];
        for ($i = 0; $i < count($titles); $i += 2) {
            if ($titles[$i] != null && array_key_exists("" . $titles[$i], $adtlist))
                $adtcols[$i + 7] = "" . $titles[$i];
        }

        // Go alumnus by alumnus
        for ($i = 0; $i < $alumnusNumber; $i++) {
            $row = $i + 7;
            $toSave = false;

            // Load data from standard_cols
            $newPars = array_combine($stdkeys, $sheet->rangeToArray("A$row:F$row")[0]);
            if (!$newPars['id']) continue;
            $alumnus = Alumnus::find($newPars['id']);

            if (!$alumnus) {
                $output .= "Alumnus at row {$row} not found; skipped\n";
                continue;
            }

            // Check and update surname and name
            if (!$newPars['surname'] || !$newPars['name']) {
                $output .= "Skipped alumnus $i due to invalid name or surname\n";
                continue;
            }
            foreach (['surname', 'name'] as $field) {
                if ($alumnus[$field] != $newPars[$field]) {
                    $toSave = true;
                    $output .= "Updated " . $field . " for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newPars[$field] . "\n";

                    $alumnus[$field] = $newPars[$field];
                }
            }

            // Check status
            $newPars['status'] = array_search($newPars['status'], Alumnus::AlumnusStatusLabels);
            if ($newPars['status'] != $alumnus['status']) {
                if (!in_array($newPars['status'], Alumnus::availableStatus($alumnus))) {
                    $output .= "Status {$newPars['status']} cannot be assigned to alumnus {$i} ({$newPars['surname']} {$newPars['name']}): skipped\n";
                } else {
                    $toSave = true;
                    $output .= "Updated status for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newPars['status'] . "\n";
                    $alumnus['status'] = $newPars['status'];
                }
            }

            // Check coorte
            $newPars['coorte'] = intval($newPars['coorte']);
            if ($newPars['coorte'] != $alumnus['coorte']) {
                $toSave = true;
                $output .= "Updated coorte for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newPars['coorte'] . "\n";
                $alumnus['coorte'] = $newPars['coorte'];
            }

            // Check tags
            $newPars['tags_array'] = array_filter(array_map('trim', explode(';', $newPars['tags'])), 'strlen');
            $oldTags = is_array($alumnus['tags']) ? implode('; ', $alumnus['tags']) : "";
            if ($oldTags != $newPars['tags']) {

                $toSave = true;
                $output .= "Updated tags for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newPars['tags'] . "\n";

                $alumnus['tags'] = $newPars['tags_array'];
            }

            if ($toSave)
                $alumnus->save();

            // Check details
            foreach ($adtcols as $col => $adtKey) {
                $newValue = $sheet->getCellByColumnAndRow($col + 1, $row)->getValue();

                $newValueDecoded = json_decode($newValue);
                if ($newValueDecoded && is_array($newValueDecoded)) {
                    $newValue = $newValueDecoded;
                } else {
                    if ($newValue == null) $newValue = [];
                    else $newValue = [$newValue];
                }

                // Special behaviour for arrayable
                if ($adtlist[$adtKey]["type"] == 'arrayable') {
                    $newValueSeparated = [];
                    foreach ($newValue as $v) {
                        foreach (preg_split("/[" . preg_quote($adtlist[$adtKey]["param"], '/') . "]/", $v, -1, PREG_SPLIT_NO_EMPTY) as $vv)
                            $newValueSeparated[] = $vv;
                    }
                    $newValue = $newValueSeparated;
                }

                // I can virtually use UpdateOrCreate here, but I want to check if the value has changed
                $prevVal = $alumnus->aDetails()->where('a_details_type_id', $adtKey)->first();
                if (
                    (!$prevVal && count($newValue) > 0) ||
                    ($prevVal && (json_encode($prevVal->value) != json_encode($newValue)))
                ) {
                    $alumnus->aDetails()->updateOrCreate(
                        ['a_details_type_id' => $adtKey],
                        ['value' => $newValue]
                    );
                    $output .= "Updated " . $adtlist[$adtKey]["name"] . " for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . json_encode($newValue) . "\n";
                }
            }
        }

        return redirect()->back()
            ->with('notistack', ['success', "Importazione eseguita con successo. " . $alumnusNumber . " alumni analizzati."])
            ->with('inertiaFlash', $output);
    }

    public function addBulk()
    {
        $this->authorize('import', Alumnus::class);

        return Inertia::render('Registry_ImpExp/AddBulk', [
            'noRatStatus' => Alumnus::availableStatus(),
            'allStatus' => Alumnus::status,
        ]);
    }


    public function addBulk_post(Request $request)
    {
        $this->authorize('import', Alumnus::class);


        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', Alumnus::status),
            'rows' => 'nullable|array',
            'rows.*' => 'array',
            'rows.*.surname' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'rows.*.name' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
            'rows.*.coorte' => 'required|numeric'
        ]);

        // Check for new status, if ratification needed
        $rat_needed = false;
        $rat_newstatus = '';
        if (!in_array($validated['status'], Alumnus::availableStatus())) {
            $rat_needed = true;
            $rat_newstatus = $validated['status'];
            $validated['status'] = 'not_reached';
        }

        foreach ($validated['rows'] as $row) {
            $alumnus = Alumnus::create([
                'surname' => $row['surname'],
                'name' => $row['name'],
                'coorte' => $row['coorte'],
                'status' => $validated['status'],
                'tags' => []
            ]);
            if ($rat_needed) {
                Ratification::create(['alumnus_id' => $alumnus->id, 'required_state' => $rat_newstatus]);
            }
        }

        return redirect()->route('registry.addBulk')->with('notistack', ['success', count($validated['rows']) . ' alumni aggiunti']);
    }
}
