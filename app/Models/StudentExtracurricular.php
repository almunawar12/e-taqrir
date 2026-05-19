<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class StudentExtracurricular extends Model {
    protected $fillable = ['student_id', 'classroom_id', 'academic_year', 'semester', 'name', 'grade', 'sort_order'];
}
