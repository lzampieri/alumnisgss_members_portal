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
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AlumnusExportImportController extends Controller
{
    public function exportExcelSchema()
    {
        $this->authorize('viewAny', Alumnus::class);
        Log::debug('Alumnus schema downloaded', []);

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
        Log::debug('Alumnus detailed list downloaded', []);

        $alumni = Alumnus::orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->with('details')
            ->get();

        $detailsTitles = array_keys(IdentityDetail::allDetails());

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
        foreach ($detailsTitles as $col => $detailsTitle) {
            $cumcol = count($titles) + 2 * $col + 1;
            $cumcolindex[$detailsTitle] = $cumcol;
            $this->writeXY($sheet, $cumcol, 6, "detID", ['font' => ['bold' => true]]);
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($cumcol))->setWidth(4);
            $this->writeXY($sheet, $cumcol + 1, 6, $detailsTitle, ['font' => ['bold' => true]]);
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
            foreach ($alumnus['details'] as $detail) {
                $cumcol = $cumcolindex[$detail->key];
                $this->writeXY($sheet, $cumcol, $i + 7, $detail['id']);
                $this->writeXY($sheet, $cumcol + 1, $i + 7, $detail['value']);
            }
        }

        // Locking some cells
        $spreadsheet->getActiveSheet()->getProtection()->setSheet(true);
        $spreadsheet->getActiveSheet()->getProtection()->setSort(true);
        $spreadsheet->getDefaultStyle()->getProtection()->setLocked(false);
        $sheet->getStyle('1:6')->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        $sheet->getStyle('A:A')->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        foreach ($cumcolindex as $key => $col) {
            $col_str = Coordinate::stringFromColumnIndex($col);
            $sheet->getStyle($col_str . ':' . $col_str)->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        }

        // Prepare space for extra details
        for ($col = 0; $col < 3; $col++) {
            $cumcol = count($titles) + 2 * count($detailsTitles) + 2 * $col + 1;
            $cumcolstr = Coordinate::stringFromColumnIndex($cumcol);
            $sheet->getColumnDimension($cumcolstr)->setWidth(4);
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($cumcol + 1))->setWidth(30);
            $sheet->getStyle($cumcolstr . ':' . $cumcolstr)->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
        }

        // Layout stuff:
        // - locking first 6 rows
        $sheet->freezePane('A7');
        // - enabling filters
        $spreadsheet->getActiveSheet()->setAutoFilter('A6:' . Coordinate::stringFromColumnIndex(count($titles) + count($detailsTitles) * 2) . '7');
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

        // Compute the details dictionary
        $detailsKeys = [];
        for ($i = 7; $i < $columnsNumber; $i += 2) {
            $detailsKeys[$i] = $sheet->getCellByColumnAndRow($i + 1, 6)->getValue();
        }

        $keys   = ['id', 'surname', 'name', 'coorte', 'status', 'tags'];

        // Go alumnus by alumnus
        for ($i = 0; $i < $alumnusNumber; $i++) {
            $row = $i + 7;

            // Load data
            $newPars = array_combine($keys, $sheet->rangeToArray("A$row:F$row")[0]);
            $alumnus = Alumnus::find($newPars['id']);

            // Check surname and name
            if (!$newPars['surname'] || !$newPars['name']) {
                $output .= "Skipped alumnus $i due to invalid name or surname\n";
                continue;
            }

            // Check status
            $newPars['status'] = array_search($newPars['status'], Alumnus::AlumnusStatusLabels);
            if (!in_array($newPars['status'], Alumnus::status))
                $newPars['status'] = 'not_reached';
            if (!in_array($newPars['status'], Alumnus::availableStatus($alumnus)))
                $newPars['status'] = $alumnus ? $alumnus['status'] : 'not_reached';

            // Check coorte
            $newPars['coorte'] = intval($newPars['coorte']);

            // Check tags
            $newPars['tags_array'] = array_filter(array_map('trim', explode(';', $newPars['tags'])), 'strlen');

            if ($alumnus) {

                $toSave = false;

                // Check par by par
                foreach (['surname', 'name', 'coorte', 'status'] as $field) {
                    if ($alumnus[$field] != $newPars[$field]) {
                        $toSave = true;
                        Log::debug('Updating', ['field' => $field, 'alumnus' => $alumnus, 'new value' => $newPars[$field]]);
                        $output .= "Updated " . $field . " for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newPars[$field] . "\n";

                        $alumnus[$field] = $newPars[$field];
                    }
                }

                // Check tags
                $oldTags = is_array($alumnus['tags']) ? implode('; ', $alumnus['tags']) : "";
                if ($oldTags != $newPars['tags']) {

                    $toSave = true;
                    Log::debug('Updating', ['field' => 'tags', 'alumnus' => $alumnus, 'new value' => $newPars['tags_array']]);
                    $output .= "Updated tags for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newPars['tags'] . "\n";

                    $alumnus['tags'] = $newPars['tags_array'];
                }

                if ($toSave)
                    $alumnus->save();
            } else {
                $alumnus = Alumnus::create([
                    'surname' => $newPars['surname'],
                    'name' => $newPars['name'],
                    'coorte' => $newPars['coorte'],
                    'status' => $newPars['status'],
                    'tags' => $newPars['tags_array'],
                ]);

                Log::debug('New alumnus created!', [$alumnus]);
                $output .= "Created new alumnus " . $alumnus['surname'] . " " . $alumnus['name'] . "\n";
            }

            // Check details
            foreach ($detailsKeys as $col => $key) {
                $oldId = $sheet->getCellByColumnAndRow($col, $row)->getValue();
                $newValue = $sheet->getCellByColumnAndRow($col + 1, $row)->getValue();

                $detail = IdentityDetail::find($oldId);

                if ($detail) {

                    // Detail already exists: check if updated needed
                    if ($newValue && strlen($key) > 0) {

                        if ($newValue != $detail['value'] || $key != $detail['key']) {
                            $detail->update(['key ' => $key, 'value' => $newValue]);
                            Log::debug('Updating detail', $detail);
                            $output .= "Updated " . $key . " for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newValue . "\n";
                        }
                    } else {

                        // New value is empty; must be deleted
                        Log::debug('Deleting detail', $detail);
                        $output .= "Deleted " . $key . " for " . $alumnus['surname'] . " " . $alumnus['name'] . "\n";
                        $detail->delete();
                    }
                } else {

                    if ($newValue && strlen($key) > 0) {
                        // New detail must be created
                        $alumnus->details()->create(['key' => $key, 'value' => $newValue]);
                        Log::debug("New detail created", $detail);
                        $output .= "Added " . $key . " for " . $alumnus['surname'] . " " . $alumnus['name'] . " to " . $newValue . "\n";
                    }
                }
            }
        }

        return redirect()->back()
            ->with('notistack', ['success', "Importazione eseguita con successo. " . $alumnusNumber . " alumni analizzati."])
            ->with('inertiaFlash', $output);
    }
}
