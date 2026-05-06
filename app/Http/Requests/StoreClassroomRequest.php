<?php
namespace App\Http\Requests;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class StoreClassroomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['super_admin', 'wali_kelas']) ?? false;
    }
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'grade_level' => ['required', 'string', 'max:20'],
            'academic_year' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/',
                Rule::unique('classrooms')->where('name', $this->input('name'))->whereNull('deleted_at'),
            ],
            'homeroom_teacher_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
