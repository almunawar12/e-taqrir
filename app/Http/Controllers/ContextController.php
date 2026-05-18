<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContextController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'academic_year' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester'      => ['required', 'integer', Rule::in([1, 2])],
        ]);

        $request->user()->update([
            'active_academic_year' => $request->academic_year,
            'active_semester'      => (int) $request->semester,
        ]);

        return back()->with('success', "Konteks periode diset ke {$request->academic_year} Semester {$request->semester}.");
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->user()->update([
            'active_academic_year' => null,
            'active_semester'      => null,
        ]);

        return back();
    }
}
