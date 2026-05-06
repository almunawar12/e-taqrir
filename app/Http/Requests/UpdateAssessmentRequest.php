<?php
namespace App\Http\Requests;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // policy check done in controller
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'items'             => ['required', 'array', 'min:1'],
            'items.*.student_id'=> ['required', 'exists:students,id'],
            'items.*.score'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.notes'     => ['nullable', 'string', 'max:500'],
            'comment'           => ['nullable', 'string', 'max:1000'],
        ];
    }
}
