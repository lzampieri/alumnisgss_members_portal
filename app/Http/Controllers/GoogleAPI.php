<?php

namespace App\Http\Controllers;

use ErrorException;

class GoogleAPI
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
}