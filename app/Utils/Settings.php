<?php

namespace App\Utils;

use App\Http\Controllers\Log;
use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;

class Settings
{

    private static Settings $obj;

    private $data = [];

    private static function filename(): string
    {
        return storage_path('app/settings.json');
    }

    private function  __construct()
    {
        // Check if .json file exists
        if (file_exists(Settings::filename())) {
            // and eventually load it
            $string = file_get_contents(Settings::filename());
            $this->data = json_decode($string, associative: true, depth: 2);
        }
    }

    private static function init(): void
    {
        if (!isset(Settings::$obj)) {
            Settings::$obj = new Settings();
        }
    }

    public static function get(string $key, mixed $default = 0): mixed
    {
        Settings::init();
        if (array_key_exists($key, Settings::$obj->data))
            return Settings::$obj->data[$key];
        // Case in which the key does not exists: it is inserted and saved!
        Settings::$obj->data[$key] = $default;
        Settings::save();
        return $default;
    }

    public static function set(string $key, mixed $value): void
    {
        Settings::init();
        Settings::$obj->data[$key] = $value;
    }

    public static function getAll(): array
    {
        Settings::init();
        return Settings::$obj->data;
    }

    public static function setAll(array $data): void
    {
        Settings::init();
        Settings::$obj->data = $data;
    }

    public static function save(): void
    {
        Settings::init();
        file_put_contents(
            Settings::filename(),
            json_encode(Settings::$obj->data, JSON_NUMERIC_CHECK)
        );
    }
}
