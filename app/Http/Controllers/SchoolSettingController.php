<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SchoolSettingController extends Controller
{
    public function index(): Response
    {
        abort_if(request()->user()?->active_role !== 'super_admin', 403);

        $profile           = Setting::schoolProfile();
        $profile['logo_url'] = $profile['logo_path']
            ? '/storage/' . $profile['logo_path']
            : null;

        return Inertia::render('SchoolSettings/Index', [
            'profile' => $profile,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_if($request->user()?->active_role !== 'super_admin', 403);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:200'],
            'foundation'   => ['nullable', 'string', 'max:200'],
            'address'      => ['nullable', 'string', 'max:500'],
            'city'         => ['nullable', 'string', 'max:100'],
            'postal_code'  => ['nullable', 'string', 'max:10'],
            'phone'        => ['nullable', 'string', 'max:30'],
            'email'        => ['nullable', 'email', 'max:100'],
            'website'      => ['nullable', 'url', 'max:200'],
            'opening_text' => ['nullable', 'string', 'max:1000'],
        ]);

        Setting::setSchoolProfile($data);

        return back()->with('success', 'Identitas sekolah berhasil diperbarui.');
    }

    public function uploadLogo(Request $request): RedirectResponse
    {
        abort_if($request->user()?->active_role !== 'super_admin', 403);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,svg', 'max:2048'],
        ]);

        $old = Setting::where('key', 'school_logo_path')->value('value');
        if ($old && Storage::disk('public')->exists($old)) {
            Storage::disk('public')->delete($old);
        }

        $path = $request->file('logo')->store('school', 'public');
        Setting::updateOrCreate(['key' => 'school_logo_path'], ['value' => $path]);

        return back()->with('success', 'Logo berhasil diunggah.');
    }

    public function destroyLogo(Request $request): RedirectResponse
    {
        abort_if($request->user()?->active_role !== 'super_admin', 403);

        $path = Setting::where('key', 'school_logo_path')->value('value');
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
        Setting::where('key', 'school_logo_path')->delete();

        return back()->with('success', 'Logo berhasil dihapus.');
    }
}
