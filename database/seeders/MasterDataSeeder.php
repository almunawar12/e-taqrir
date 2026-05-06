<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $classrooms = Classroom::factory(5)->create();

        Subject::factory(10)->create();

        // 50 santri tersebar di 5 kelas (10/kelas)
        $classrooms->each(function (Classroom $classroom) {
            Student::factory(10)->inClassroom($classroom)->create();
        });
    }
}
