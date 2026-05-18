<?php

use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AssessmentFinalController;
use App\Http\Controllers\BobotController;
use App\Http\Controllers\ContextController;
use App\Http\Controllers\ScoreImportController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\EvidenceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleSwitchController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/dashboard', App\Http\Controllers\DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/context', [ContextController::class, 'store'])->name('context.store');
    Route::delete('/context', [ContextController::class, 'destroy'])->name('context.destroy');

    Route::post('/role/switch', RoleSwitchController::class)
        ->middleware('throttle:20,1')
        ->name('role.switch');

    // Users (super_admin only)
    Route::resource('users', UserController::class)->except(['show', 'create', 'edit']);

    // Master Data
    Route::resource('classrooms', ClassroomController::class)->except(['create', 'edit']);
    Route::post('classrooms/{id}/restore', [ClassroomController::class, 'restore'])->name('classrooms.restore');
    Route::post('classrooms/{classroom}/assign', [ClassroomController::class, 'assignStudent'])->name('classrooms.assign');
    Route::delete('classrooms/{classroom}/students/{student}', [ClassroomController::class, 'removeStudent'])->name('classrooms.students.remove');

    Route::resource('subjects', SubjectController::class)->except(['show', 'create', 'edit']);
    Route::post('subjects/{id}/restore', [SubjectController::class, 'restore'])->name('subjects.restore');
    Route::put('subjects/{subject}/teachers', [SubjectController::class, 'syncTeachers'])->name('subjects.teachers.sync');
    Route::put('subjects/{subject}/classrooms', [SubjectController::class, 'syncClassrooms'])->name('subjects.classrooms.sync');

    Route::get('students/template', [StudentController::class, 'downloadTemplate'])->name('students.template');
    Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
    Route::resource('students', StudentController::class)->except(['show', 'create', 'edit']);
    Route::post('students/{id}/restore', [StudentController::class, 'restore'])->name('students.restore');

    // Assessment Workflow
    Route::get('nilai-akhir',                           [AssessmentFinalController::class, 'index'])->name('nilai-akhir.index');
    Route::post('nilai-akhir/submit',                   [AssessmentFinalController::class, 'submit'])->name('nilai-akhir.submit');
    Route::get('nilai-akhir/{classroomId}/{subjectId}', [AssessmentFinalController::class, 'show'])->name('nilai-akhir.show');

    Route::get('bobot',  [BobotController::class, 'index'])->name('bobot.index');
    Route::put('bobot',  [BobotController::class, 'update'])->name('bobot.update');

    Route::resource('assessments', AssessmentController::class);
    Route::post('assessments/{assessment}/transition', [AssessmentController::class, 'transition'])
        ->name('assessments.transition');

    // Score import/export
    Route::get('assessments/{assessment}/scores/template', [ScoreImportController::class, 'downloadTemplate'])->name('assessments.scores.template');
    Route::post('assessments/{assessment}/scores/import', [ScoreImportController::class, 'import'])->name('assessments.scores.import');

    // Evidence
    Route::post('assessments/{assessment}/evidence', [EvidenceController::class, 'store'])->name('assessments.evidence.store');
    Route::delete('assessments/{assessment}/evidence', [EvidenceController::class, 'destroy'])->name('assessments.evidence.destroy');
    Route::get('assessments/{assessment}/evidence', [EvidenceController::class, 'show'])->name('assessments.evidence.show');
});

require __DIR__.'/auth.php';
