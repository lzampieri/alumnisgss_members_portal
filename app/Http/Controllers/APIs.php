<?php

namespace App\Http\Controllers;

use App\Utils\Settings;
use Carbon\Carbon;
use ErrorException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class APIs extends Controller
{
    public static function computeRoutes(string $originId, string $destinationId)
    {
        $url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-Goog-Api-Key: ' . env('GEOCODING_API_KEY', ''),
            'X-Goog-FieldMask: ' . 'routes.distanceMeters',
        ]);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            "origin" => [ "placeId" => $originId ],
            "destination" => [ "placeId" => $destinationId ],
            "travelMode" => "DRIVE",
            "computeAlternativeRoutes" => true,
            "units" => "METRIC"
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $output = curl_exec($ch);

        if ($output === false) {
            throw new ErrorException(curl_error($ch));
        }

        // get API response
        $rsp = json_decode($output, true);

        if ($rsp === null) {
            throw new ErrorException('Invalid JSON response: ' . json_last_error_msg());
        }

        return $rsp;
    }

    const ACI_FILE = 'app/apis/aci/prices.json';

    public static function updateACIprices() {

        $url = Settings::get('ACIpricesURL', '');

        if( strlen($url) == 0 ) {
            return redirect()->back()->with('notistack', ['error', 'URL non configurata. Imposta ACIpricesURL nei parametri del sito.']); 
        }

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $output = curl_exec($ch);
        
        if ($output === false) {
            return redirect()->back()->with('notistack', ['error', 'Errore CURL: ' . curl_error($ch)]); 
        }

        $parser = new \Com\Tecnick\Pdf\Parser\Parser();
        $data = $parser->parse((string) $output);

        if ($data === false) {
            return redirect()->back()->with('notistack', ['error', 'Errore parser']); 
        }

        # Collect all the PDF content
        $content = "";
        foreach ($data[1] as $objname => $objs) {
            foreach ($objs as $ROA_ID => $ROA) {
                foreach ($ROA as $RO_ID => $RO) {
                    if( $RO_ID == 3 ) {
                        foreach ( $RO as $decodedStream ) {
                            if( is_array($decodedStream) ) {
                                foreach ( $decodedStream as $streamSection ) {
                                    $content .= $streamSection;
                                }
                            } else {
                                $content .= $decodedStream;
                            }
                        }
                    }
                }
            }
        }

        $content_clean = str_replace(array("\n\r", "\n", "\r"), "", $content);

        # Split the PDF content in blocks of data
        $blocks = explode(" BDC ", $content_clean);

        $lines = [];
        $last_pos = 0;
        foreach( $blocks as $block ) {
            # Obtain the position of the block
            if( !preg_match("/[\d\.]+ ([\d\.]+) [\d\.]+ [\d\.]+ re/", $block, $positions) )
                continue;
            if( $positions[1] != $last_pos ) {
                # If the block has a y-position different from the last one,
                # add a new line
                $last_pos = $positions[1];
                $lines[] = [];
            }

            # Obtain the text
            if( !preg_match("/G\[([\w,\.\(\)\/]+)\]/", $block, $text) )
                continue;
            # Obtain the actual strings inside the text
            if( !preg_match_all("/\(([\w,\.\/]+)\)/", $text[1], $strings) )
                continue;
            $lines[count($lines)-1][] = implode("", $strings[1]);
        }

        # Now, analyze each line and try to parse the data
        $keys = [
            "petrol", "carDiesel", "gpl", "methane", "electricity"
        ];
        $finalTable = [];
        foreach( $lines as $line ) {
            if( count($line) != count($keys) + 1 )
                continue;

            # Verify that the first element is a date
            try {
                $date = Carbon::createFromFormat("d/m/Y", $line[0]);
                if( !$date->isBefore(Carbon::now()) )
                    continue;
                if( !$date->isAfter(Carbon::now()->subYears(10)) )
                    continue;
            } catch (Exception $e) {
                continue;
            }

            $out = [$line[0]];

            // Verify that the other elements are number
            for( $i = 1; $i < count($line); $i++ ) {
                $line_withpoint = str_replace(",", ".", $line[$i]);
                if( !is_numeric($line_withpoint) )
                    continue;
                if( floatval($line_withpoint) < 0.001 || floatval($line_withpoint) > 10 )
                    continue;

                $out[] = floatval($line_withpoint);
            }
            
            if( count($out) != count($keys) + 1 )
                continue;

            $finalTable[] = $out;
        }

        # Save the file!
        $toSave = [
            'updated' => Carbon::now(),
            'cols' => $keys,
            'data' => $finalTable,
            'file' => $url
        ];

        file_put_contents(
            storage_path(APIs::ACI_FILE),
            json_encode($toSave, JSON_NUMERIC_CHECK)
        );

        return response("Done, saved!");
    }

    public static function getAciPrices(Carbon $date) {
        if (!file_exists(storage_path(APIs::ACI_FILE))) {
            APIs::updateAciPrices();
        }

        $string = file_get_contents(storage_path(APIs::ACI_FILE));
        $data = json_decode($string, associative: true, depth: 5);

        $actual_data = $data['data'][count($data['data']) - 1];
        foreach( $data['data'] as $row ) {
            if( Carbon::createFromFormat("d/m/Y", $row[0])->isAfter($date) ) {
                $actual_data = $row;
                break;
            }
        }

        $output = [
            "updated" => $data['updated'],
            "forDate" => $date->format("d/m/Y"),
            "realDate" => $actual_data[0],
            "prices" => []
        ];

        for( $i = 0; $i < count($data['cols']); $i++ ) {
            $output["prices"][$data['cols'][$i]] = $actual_data[$i+1];
        }

        return $output;
    }

    public function AciPricesTester(Request $request) {
        if( $request->has("date"))
            $date = Carbon::createFromFormat("Y-m-d", $request->input("date"));
        else
            $date = Carbon::now();

        return Inertia::render('Webmaster/AciPricesTester', [
            'forDate' => $date,
            'data' => $this->getAciPrices($date)
        ]);
    }

    const ACI_TABLE = 'app/apis/aci/tables/';

    public static function getAciTable() {
        $filename = Settings::get('aci_table', '');
        
        if (!file_exists(storage_path(APIs::ACI_TABLE . $filename))) {
            throw new ErrorException("File not found: " . $filename);
        }

        $string = file_get_contents(storage_path(APIs::ACI_TABLE . $filename));
        $data = json_decode($string, associative: true, depth: 5);

        return $data;
    }

    public function getAciTableAsResponse() {
        return response()->json(APIs::getAciTable());
    }
}