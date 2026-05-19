<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EvidenceController extends Controller
{
    private const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    private const MAX_MB = 10;

    public function store(Request $request, Assessment $assessment): JsonResponse
    {
        $this->authorize('update', $assessment);

        $request->validate([
            'evidence' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png,webp',
                'max:' . (self::MAX_MB * 1024),
            ],
        ]);

        $file = $request->file('evidence');
        $disk = Storage::disk('evidence');

        // delete old file if exists
        if ($assessment->evidence_path) {
            $disk->delete($assessment->evidence_path);
        }

        $path = $disk->putFileAs(
            $assessment->id,
            $file,
            Str::uuid() . '.' . $file->getClientOriginalExtension(),
        );

        $assessment->forceFill([
            'evidence_path' => $path,
            'evidence_disk' => 'evidence',
            'evidence_name' => $file->getClientOriginalName(),
        ])->save();

        return response()->json(['path' => $path, 'name' => $file->getClientOriginalName()]);
    }

    public function destroy(Assessment $assessment): JsonResponse
    {
        $this->authorize('update', $assessment);

        if ($assessment->evidence_path) {
            Storage::disk($assessment->evidence_disk)->delete($assessment->evidence_path);
            $assessment->forceFill([
                'evidence_path' => null,
                'evidence_name' => null,
            ])->save();
        }

        return response()->json(['deleted' => true]);
    }

    public function show(Assessment $assessment): Response|\Illuminate\Http\RedirectResponse
    {
        $this->authorize('view', $assessment);

        if (!$assessment->evidence_path) {
            abort(404);
        }

        $disk = Storage::disk($assessment->evidence_disk ?? 'evidence');
        $driver = config('filesystems.disks.' . ($assessment->evidence_disk ?? 'evidence') . '.driver');

        // S3: redirect to temporary signed URL (5 min expiry)
        if ($driver === 's3') {
            try {
                return redirect($disk->temporaryUrl($assessment->evidence_path, now()->addMinutes(5)));
            } catch (\Exception $e) {
                abort(503, 'Berkas tidak dapat diakses saat ini.');
            }
        }

        // Local: stream file directly
        if (!$disk->exists($assessment->evidence_path)) {
            abort(404);
        }

        return response($disk->get($assessment->evidence_path), 200, [
            'Content-Type'        => $disk->mimeType($assessment->evidence_path),
            'Content-Disposition' => 'inline; filename="' . ($assessment->evidence_name ?? 'evidence') . '"',
        ]);
    }
}
