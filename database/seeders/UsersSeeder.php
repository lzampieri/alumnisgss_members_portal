<?php

namespace Database\Seeders;

use App\Models\Alumnus;
use App\Models\Block;
use App\Models\External;
use App\Models\Email;
use Illuminate\Database\Seeder;
use PhpOption\None;

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

        $webmaster_lm = Email::create([
            'credential' => 'zampieri.leonardo98@gmail.com',
        ]);
        $webmaster_lm->identity()->associate( $webmaster_user )->save();

        $webmaster_user->assignRole('webmaster');

        // Extra users for debug
        if( env('APP_ENV') == 'local' ) {

            $webmaster_user->assignRole('secretariat');

            Email::create([
                'credential' => 'zampieri.leonardo99@gmail.com',
            ])->identity()->associate( $webmaster_user )->save();
            Email::create([
                'credential' => 'zampieri.leonardo00@gmail.com',
            ])->identity()->associate( $webmaster_user )->save();


            $secretariat_user = External::create([
                'name' => 'segretario',
                'surname' => 'unimib'
            ]);

            $secretariat_lm = Email::create([
                'credential' => 'l.zampieri4@campus.unimib.it',
            ]);
            $secretariat_lm->identity()->associate( $secretariat_user )->save();

            $secretariat_user->assignRole('secretariat');
            $secretariat_user->givePermissionTo('login');


            $alumnus_user = Alumnus::create([
                'name' => 'alumno',
                'surname' => 'unipd',
                'coorte' => 12,
                'status' => 'member',
                'tags' => []
            ]);

            $alumnus_user_lm = Email::create([
                'credential' => 'leonardo.zampieri@studenti.unipd.it',
            ]);
            $alumnus_user_lm->identity()->associate( $alumnus_user )->save();
            $alumnus_user->givePermissionTo('login');
        
            $orphan_lm = Email::create([
                'credential' => 'leonardo.zampieri2@studenti.unipd.it',
                'comment' => "Qui la richiesta d'accesso\nche in teoria può occupare\ntre linee"
            ]);
        }

    }
}
