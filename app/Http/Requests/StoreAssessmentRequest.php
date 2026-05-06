<?php
namespace App\Http\Requests;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['super_admin', 'guru_mapel']) ?? false;
    }

    public function rules(): array
    {
        return [
            'classroom_id'  => ['required', 'exists:classrooms,id'],
            'subject_id'    => ['required', 'exists:subjects,id'],
            'academic_year' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester'      => ['required', 'integer', Rule::in([1, 2])],
        ];
    }
}
