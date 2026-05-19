<?php

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    private static int $nisSeq = 1;

    private static array $maleNames = [
        'Ahmad Fauzi', 'Muhammad Rizki', 'Abdullah Hasan', 'Yusuf Hakim',
        'Ibrahim Sholeh', 'Umar Faruq', 'Ali Murtadho', 'Hasan Basri',
        'Bilal Ramadhan', 'Zaid Mubarak',
    ];

    private static array $femaleNames = [
        'Fatimah Azzahra', 'Aisyah Putri', 'Khadijah Nurul', 'Maryam Sari',
        'Zainab Fitri', 'Hafshah Dewi', 'Ruqayyah Indah', 'Ummu Kultsum',
        'Asma Rahayu', 'Sumayyah Wulandari',
    ];

    private static array $cities = [
        'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang',
        'Yogyakarta', 'Malang', 'Bogor', 'Depok', 'Tangerang',
    ];

    private static int $nameIdx = 0;

    public function definition(): array
    {
        $gender = self::$nisSeq % 2 === 0 ? 'P' : 'L';
        $namePool = $gender === 'L' ? self::$maleNames : self::$femaleNames;
        $name = $namePool[self::$nameIdx % count($namePool)];
        $city = self::$cities[self::$nisSeq % count(self::$cities)];
        $birthYear = date('Y') - rand(13, 18);
        $birthDate = $birthYear . '-' . str_pad((string) rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad((string) rand(1, 28), 2, '0', STR_PAD_LEFT);
        self::$nameIdx++;

        return [
            'nis' => str_pad((string) self::$nisSeq++, 8, '0', STR_PAD_LEFT),
            'name' => $name,
            'gender' => $gender,
            'birth_date' => $birthDate,
            'birth_place' => $city,
            'address' => 'Jl. Pesantren No. ' . rand(1, 100) . ', ' . $city,
            'wali_phone' => '08' . str_pad((string) rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
            'classroom_id' => null,
        ];
    }

    public function inClassroom(Classroom $classroom): static
    {
        return $this->state(['classroom_id' => $classroom->id]);
    }
}
