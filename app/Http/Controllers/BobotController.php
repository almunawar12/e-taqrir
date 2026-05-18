<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BobotController extends Controller
{
    public function index(): Response
    {
        abort_if(request()->user()?->active_role !== 'super_admin', 403);

        return Inertia::render('Bobot/Index', [
            'weights' => Setting::weights(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_if($request->user()?->active_role !== 'super_admin', 403);

        $data = $request->validate([
            'harian' => ['required', 'numeric', 'min:0', 'max:100'],
            'uts'    => ['required', 'numeric', 'min:0', 'max:100'],
            'uas'    => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $total = $data['harian'] + $data['uts'] + $data['uas'];
        if (abs($total - 100) > 0.001) {
            throw ValidationException::withMessages([
                'harian' => "Total bobot harus 100%. Saat ini: {$total}%.",
            ]);
        }

        Setting::setWeights($data['harian'], $data['uts'], $data['uas']);

        return back()->with('success', 'Bobot nilai berhasil diperbarui.');
    }
}
