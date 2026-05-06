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

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['L', 'P']);

        return [
            'nis' => str_pad((string) self::$nisSeq++, 8, '0', STR_PAD_LEFT),
            'name' => $gender === 'L'
                ? $this->faker->firstNameMale() . ' ' . $this->faker->lastName()
                : $this->faker->firstNameFemale() . ' ' . $this->faker->lastName(),
            'gender' => $gender,
            'birth_date' => $this->faker->dateTimeBetween('-20 years', '-10 years')->format('Y-m-d'),
            'birth_place' => $this->faker->city(),
            'address' => $this->faker->address(),
            'wali_phone' => '08' . $this->faker->numerify('#########'),
            'classroom_id' => null,
        ];
    }

    public function inClassroom(Classroom $classroom): static
    {
        return $this->state(['classroom_id' => $classroom->id]);
    }
}
