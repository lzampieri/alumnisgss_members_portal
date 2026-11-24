<?php

namespace App\Http\Controllers;

use App\Models\FormResponse;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Exception as PhpSpreadsheetException;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class FormResponseController extends Controller
{
    // Form from resource
    public function save_form(Request $request, Resource $resource)
    {
        $this->authorize('submit', $resource);

        $validated = $request->validate([
            'data' => 'required',
            'form_email_to' => 'present|nullable|string'
        ]);

        $fr = new FormResponse(
            [
                "data" => $validated['data'],
                "form_email_to" => $validated["form_email_to"]
            ]
        );
        $fr->resource()->associate($resource);

        if (Auth::check())
            $fr->sender()->associate(Auth::user());

        $fr->save();

        if (strlen($resource->form_email_to ?? "") || strlen($fr->form_email_to ?? "")) {
            MailerController::sendEmail(
                [...explode(",", $resource->form_email_to),...explode(",", $fr->form_email_to)],
                "Nuova risposta al modulo " . $resource['title'],
                $fr->toHtml()
            );
        }

        return redirect()->back();
    }

    // Form responses from resource
    public function show_responses(Request $request, Resource $resource)
    {
        $this->authorize('viewResponses', $resource);

        $resource->load('responses')->makeVisible('responses');

        return Inertia::render('Resources/Form/Responses', ['resource' => $resource]);
    }


    public function show_responses_xlsx(Resource $resource)
    {
        $this->authorize('viewResponses', $resource);

        $resource->load('responses');

        $resourceParsed = $resource->toArray();
        $cols_names = [];
        foreach (json_decode($resourceParsed['content'], true) as $field) {
            if (array_key_exists("title", $field))
                $cols_names[$field["id"]] = $field["title"];
        }
        $cols_arethere = [];
        foreach ($resourceParsed["responses"] as $id => $response) {
            $resourceParsed["responses"][$id]["data"] = json_decode($response["data"], true);
            foreach (array_keys($resourceParsed["responses"][$id]["data"]) as $key) {
                $cols_arethere[$key] = true;
            }
        }

        $cols_id = [];
        foreach (array_keys($cols_names) as $k) {
            if (array_key_exists($k, $cols_arethere)) {
                $cols_id[] = $k;
            }
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', "Risposte al modulo " . $resource['title']);
        $sheet->setCellValue('A2', "#" . $resource['id']);
        $sheet->setCellValue('A3', "Scaricato il " . date('d/m/Y') . " da " . Auth::user()->surnameAndName() . " tramite il portale soci.");

        $sheet->setCellValue([1, 5], "Data");
        foreach ($cols_id as $i => $k) {
            $sheet->setCellValue([$i + 2, 5], $cols_names[$k]);
        }

        foreach ($resourceParsed["responses"] as $id => $response) {
            $sheet->setCellValue([1, 6 + $id], $response["created_at"]);
            foreach ($cols_id as $i => $k) {
                if (array_key_exists($k, $response["data"])) {
                    try {
                        $sheet->setCellValue([$i + 2, 6 + $id], $response["data"][$k]);
                    } catch (PhpSpreadsheetException $ex) {
                        $sheet->setCellValue([$i + 2, 6 + $id], json_encode($response["data"][$k]));
                    }
                }
            }
        }

        // Output
        $writer = new Xlsx($spreadsheet);
        $writer->setPreCalculateFormulas(false);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'responses_' . $resource['id'] . '_' . date('Ymd') . '_' . env('APP_ENV', 'debug') .  '.xlsx');
    }
}
