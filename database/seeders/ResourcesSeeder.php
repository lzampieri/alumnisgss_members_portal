<?php

namespace Database\Seeders;

use App\Models\ResourcesSection;
use Illuminate\Database\Seeder;

class ResourcesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ResourcesSection::create([
            'name' => 'modules',
            'title' => 'Modulistica'
        ]);
        ResourcesSection::create([
            'name' => 'members_modules',
            'title' => 'Modulistica soci'
        ]);
    }
}
