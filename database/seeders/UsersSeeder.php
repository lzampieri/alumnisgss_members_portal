<?php

namespace Database\Seeders;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\LoginMethod;
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
        $webmaster_user = External::create([
            'name' => 'webmaster'
        ]);

        $webmaster_lm = LoginMethod::create([
            'driver' => 'google',
            'credential' => 'zampieri.leonardo98@gmail.com',
        ]);
        $webmaster_lm->identity()->associate( $webmaster_user )->save();

        $webmaster_user->assignRole('webmaster');


        $secretariat_user = External::create([
            'name' => 'segretario',
            'surname' => 'unimib'
        ]);

        $secretariat_lm = LoginMethod::create([
            'driver' => 'google',
            'credential' => 'l.zampieri4@campus.unimib.it',
        ]);
        $secretariat_lm->identity()->associate( $secretariat_user )->save();

        $secretariat_user->assignRole('secretariat');
        $secretariat_user->givePermissionTo('login');


        $alumnus_user = Alumnus::create([
            'name' => 'alumno',
            'surname' => 'unipd',
            'coorte' => 12,
            'status' => 'member'
        ]);

        $alumnus_user_lm = LoginMethod::create([
            'driver' => 'google',
            'credential' => 'leonardo.zampieri@studenti.unipd.it',
        ]);
        $alumnus_user_lm->identity()->associate( $alumnus_user )->save();
        $alumnus_user->givePermissionTo('login');
    
        $orphan_lm = LoginMethod::create([
            'driver' => 'google',
            'credential' => 'leonardo.zampieri2@studenti.unipd.it',
        ]);

    }
}
