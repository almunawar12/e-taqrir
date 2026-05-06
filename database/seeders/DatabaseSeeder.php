<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([RoleSeeder::class, MasterDataSeeder::class]);

        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@etaqrir.test',
        ]);
        $admin->assignRole('super_admin');
        $admin->forceFill(['active_role' => 'super_admin'])->save();

        $wali = User::factory()->create([
            'name' => 'Wali Kelas Demo',
            'email' => 'wali.kelas@etaqrir.test',
        ]);
        $wali->assignRole('wali_kelas');
        $wali->forceFill(['active_role' => 'wali_kelas'])->save();

        $guru = User::factory()->create([
            'name' => 'Guru Mapel Demo',
            'email' => 'guru@etaqrir.test',
        ]);
        $guru->assignRole(['guru_mapel', 'wali_kelas']);
        $guru->forceFill(['active_role' => 'guru_mapel'])->save();

        $wsantri = User::factory()->create([
            'name' => 'Wali Santri Demo',
            'email' => 'walisantri@etaqrir.test',
        ]);
        $wsantri->assignRole('wali_santri');
        $wsantri->forceFill(['active_role' => 'wali_santri'])->save();
    }
}
