<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $role = $user->active_role;

        $stats = match ($role) {
            'super_admin' => $this->adminStats(),
            'wali_kelas'  => $this->waliKelasStats($user),
            'guru_mapel'  => $this->guruStats($user),
            'wali_santri' => $this->waliSantriStats(),
            default       => [],
        };

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'role'  => $role,
        ]);
    }

    private function adminStats(): array
    {
        $stateCounts = Assessment::query()
            ->select('state', DB::raw('count(*) as total'))
            ->groupBy('state')
            ->pluck('total', 'state')
            ->toArray();

        $recentAssessments = Assessment::with(['classroom:id,name', 'subject:id,name,code', 'teacher:id,name'])
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get(['id', 'classroom_id', 'subject_id', 'teacher_id', 'state', 'academic_year', 'semester', 'updated_at']);

        return [
            'totals' => [
                'classrooms' => Classroom::count(),
                'students'   => Student::count(),
                'subjects'   => Subject::count(),
                'assessments'=> Assessment::count(),
            ],
            'by_state' => [
                'draft'     => $stateCounts['draft']     ?? 0,
                'submitted' => $stateCounts['submitted'] ?? 0,
                'verified'  => $stateCounts['verified']  ?? 0,
                'published' => $stateCounts['published'] ?? 0,
                'rejected'  => $stateCounts['rejected']  ?? 0,
            ],
            'recent_assessments' => $recentAssessments,
        ];
    }

    private function waliKelasStats(mixed $user): array
    {
        $pendingVerification = Assessment::where('state', 'submitted')->count();
        $verified            = Assessment::where('state', 'verified')->count();
        $published           = Assessment::where('state', 'published')->count();

        $queue = Assessment::with(['classroom:id,name', 'subject:id,name,code', 'teacher:id,name'])
            ->whereIn('state', ['submitted', 'verified'])
            ->orderBy('submitted_at')
            ->limit(8)
            ->get(['id', 'classroom_id', 'subject_id', 'teacher_id', 'state', 'academic_year', 'semester', 'submitted_at']);

        return [
            'pending_verification' => $pendingVerification,
            'verified'             => $verified,
            'published'            => $published,
            'queue'                => $queue,
        ];
    }

    private function guruStats(mixed $user): array
    {
        $stateCounts = Assessment::where('teacher_id', $user->id)
            ->select('state', DB::raw('count(*) as total'))
            ->groupBy('state')
            ->pluck('total', 'state')
            ->toArray();

        $myAssessments = Assessment::with(['classroom:id,name', 'subject:id,name,code'])
            ->where('teacher_id', $user->id)
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get(['id', 'classroom_id', 'subject_id', 'state', 'academic_year', 'semester', 'updated_at']);

        return [
            'by_state' => [
                'draft'     => $stateCounts['draft']     ?? 0,
                'submitted' => $stateCounts['submitted'] ?? 0,
                'verified'  => $stateCounts['verified']  ?? 0,
                'published' => $stateCounts['published'] ?? 0,
                'rejected'  => $stateCounts['rejected']  ?? 0,
            ],
            'my_assessments' => $myAssessments,
        ];
    }

    private function waliSantriStats(): array
    {
        return [];
    }
}
