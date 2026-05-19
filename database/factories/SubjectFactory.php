<?php

namespace Database\Factories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subject>
 */
class SubjectFactory extends Factory
{
    private static int $seq = 1;

    public function definition(): array
    {
        $subjects = [
            ['code' => 'QUR', 'name' => "Al-Qur'an", 'category' => 'Agama'],
            ['code' => 'HAD', 'name' => 'Hadits', 'category' => 'Agama'],
            ['code' => 'FIK', 'name' => 'Fiqih', 'category' => 'Agama'],
            ['code' => 'AKI', 'name' => 'Aqidah', 'category' => 'Agama'],
            ['code' => 'MTK', 'name' => 'Matematika', 'category' => 'Umum'],
            ['code' => 'BIN', 'name' => 'Bahasa Indonesia', 'category' => 'Umum'],
            ['code' => 'BIG', 'name' => 'Bahasa Inggris', 'category' => 'Umum'],
            ['code' => 'BAR', 'name' => 'Bahasa Arab', 'category' => 'Agama'],
            ['code' => 'IPA', 'name' => 'Ilmu Pengetahuan Alam', 'category' => 'Umum'],
            ['code' => 'IPS', 'name' => 'Ilmu Pengetahuan Sosial', 'category' => 'Umum'],
        ];

        $pick = $subjects[(self::$seq - 1) % count($subjects)];
        $code = $pick['code'] . '-' . str_pad((string) self::$seq, 3, '0', STR_PAD_LEFT);
        self::$seq++;

        return [
            'code' => $code,
            'name' => $pick['name'],
            'category' => $pick['category'],
            'credit_hours' => [2, 2, 2, 3, 4][array_rand([2, 2, 2, 3, 4])],
        ];
    }
}
