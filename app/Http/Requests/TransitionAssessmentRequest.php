<?php
namespace App\Http\Requests;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransitionAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'action'  => ['required', Rule::in(['submit', 'verify', 'reject', 'publish', 'reset'])],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
