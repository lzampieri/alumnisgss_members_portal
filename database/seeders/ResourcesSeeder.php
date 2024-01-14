<?php

namespace Database\Seeders;

use App\Models\DynamicPermission;
use App\Models\Resource;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class ResourcesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $res = Resource::create([
            'title' => 'Vedere'
        ]);
        DynamicPermission::createFromRelations( 'view', $res, Role::findByName( 'everyone' ) );
        DynamicPermission::createFromRelations( 'edit', $res, Role::findByName( 'member' ) );
        
        
        $res = Resource::create([
            'title' => 'Modificare'
        ]);
        DynamicPermission::createFromRelations( 'view', $res, Role::findByName( 'member' ) );
        DynamicPermission::createFromRelations( 'edit', $res, Role::findByName( 'secretariat' ) );

        $res = Resource::create([
            'title' => 'Non vedere'
        ]);
        DynamicPermission::createFromRelations( 'edit', $res, Role::findByName( 'member' ) );


    }
}
