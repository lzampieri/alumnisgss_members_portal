<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::create(['name' => 'log-manage']);
        Permission::create(['name' => 'members-view']);
        Permission::create(['name' => 'alumnus-view']);
        Permission::create(['name' => 'alumnus-edit']);
        Permission::create(['name' => 'alumnus-bulk']);


        // create roles
        Role::create(['name' => 'secretariary'])
            ->givePermissionTo(['members-view', 'alumnus-view', 'alumnus-edit']);

        Role::create(['name' => 'webmaster'])
            ->givePermissionTo(Permission::all());
    }
}
