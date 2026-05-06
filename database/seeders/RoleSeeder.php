<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public const ROLES = [
        'super_admin',
        'wali_kelas',
        'guru_mapel',
        'wali_santri',
    ];

    public function run(): void
    {
        Artisan::call('permission:cache-reset');

        foreach (self::ROLES as $name) {
            Role::findOrCreate($name, 'web');
        }
    }
}
