<?php
namespace App\Http\Requests;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['super_admin', 'wali_kelas']) ?? false;
    }
    public function rules(): array
    {
        $id = $this->route('student');
        return [
            'nis' => ['required', 'string', 'max:20', Rule::unique('students')->whereNull('deleted_at')->ignore($id)],
            'name' => ['required', 'string', 'max:150'],
            'gender' => ['required', Rule::in(['L', 'P'])],
            'birth_date' => ['nullable', 'date'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'wali_phone' => ['nullable', 'string', 'max:20'],
            'classroom_id' => ['nullable', 'exists:classrooms,id'],
        ];
    }
}
