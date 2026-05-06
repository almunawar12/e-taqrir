<?php

namespace Database\Factories;

use App\Models\Classroom;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Classroom>
 */
class ClassroomFactory extends Factory
{
    private static array $pool = [
        ['VII', 'A'], ['VII', 'B'], ['VIII', 'A'], ['VIII', 'B'],
        ['IX', 'A'], ['IX', 'B'], ['X', 'A'], ['X', 'B'],
        ['XI', 'A'], ['XI', 'B'], ['XII', 'A'], ['XII', 'B'],
    ];

    private static int $idx = 0;

    public function definition(): array
    {
        $item = self::$pool[self::$idx % count(self::$pool)];
        self::$idx++;
        [$grade, $suffix] = $item;
        $year = date('Y') . '/' . (date('Y') + 1);

        return [
            'name' => "Kelas {$grade} {$suffix}",
            'grade_level' => $grade,
            'academic_year' => $year,
            'homeroom_teacher_id' => null,
        ];
    }
}
