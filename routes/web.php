<?php

use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\EvidenceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleSwitchController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', App\Http\Controllers\DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/role/switch', RoleSwitchController::class)
        ->middleware('throttle:20,1')
        ->name('role.switch');

    // Master Data
    Route::resource('classrooms', ClassroomController::class)->except(['show', 'create', 'edit']);
    Route::post('classrooms/{id}/restore', [ClassroomController::class, 'restore'])->name('classrooms.restore');

    Route::resource('subjects', SubjectController::class)->except(['show', 'create', 'edit']);
    Route::post('subjects/{id}/restore', [SubjectController::class, 'restore'])->name('subjects.restore');

    Route::resource('students', StudentController::class)->except(['show', 'create', 'edit']);
    Route::post('students/{id}/restore', [StudentController::class, 'restore'])->name('students.restore');

    // Assessment Workflow
    Route::resource('assessments', AssessmentController::class);
    Route::post('assessments/{assessment}/transition', [AssessmentController::class, 'transition'])
        ->name('assessments.transition');

    // Evidence
    Route::post('assessments/{assessment}/evidence', [EvidenceController::class, 'store'])->name('assessments.evidence.store');
    Route::delete('assessments/{assessment}/evidence', [EvidenceController::class, 'destroy'])->name('assessments.evidence.destroy');
    Route::get('assessments/{assessment}/evidence', [EvidenceController::class, 'show'])->name('assessments.evidence.show');
});

require __DIR__.'/auth.php';
