<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $webmaster = User::create([
            'email' => 'zampieri.leonardo98@gmail.com'
        ]);
        $webmaster->assignRole('webmaster');
    }
}
