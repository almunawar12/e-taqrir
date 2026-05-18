<?php
namespace App\Http\Requests;
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
        $user = $this->user();

        // guru_mapel may only submit assessments for subjects assigned to them
        $subjectRule = $user?->active_role === 'guru_mapel'
            ? Rule::exists('subject_user', 'subject_id')->where('user_id', $user->id)
            : Rule::exists('subjects', 'id');

        $subjectId = $this->input('subject_id');

        return [
            'classroom_id'  => [
                'required',
                'exists:classrooms,id',
                Rule::exists('classroom_subject', 'classroom_id')->where('subject_id', $subjectId),
            ],
            'subject_id'    => ['required', $subjectRule],
            'academic_year' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester'      => ['required', 'integer', Rule::in([1, 2])],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.exists' => 'Anda tidak memiliki akses untuk mata pelajaran ini.',
        ];
    }
}
