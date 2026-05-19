<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class StudentAbsence extends Model {
    protected $fillable = ['student_id', 'classroom_id', 'academic_year', 'semester', 'sakit', 'izin', 'alpha', 'notes'];
}
