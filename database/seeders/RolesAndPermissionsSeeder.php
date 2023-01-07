<?php

namespace Database\Seeders;

use App\Http\Controllers\PermissionsController;
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

        
        // create roles
        Role::create(['name' => 'secretariat']);
        $wm = Role::create(['name' => 'webmaster']);
        
        // create permissions
        PermissionsController::verify();

        // all permissions to webmaster
        $wm->givePermissionTo(Permission::all());
    }
}
