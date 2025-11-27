<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;


Route::get('/email-verification', function () {
    return Inertia::render('EmailVerification');
});

Route::get('/', function (Request $request) {
    if ($request->session()->get('verified')) {
        return redirect('/finance-dashboard');
    }
    return Inertia::render('EmailVerification');
});

Route::get('/admin', function (Request $request) {
    if ($request->session()->get('admin_verified')) {
        return redirect('/admin/dashboard');
    }
    return Inertia::render('AdminLogin');
});

Route::middleware('verified')->group(function () {
    Route::get('/finance-dashboard', function () {
        return Inertia::render('Dashboard');
    });

    Route::get('/finance', function () {
        return Inertia::render('FinanceView');
    });

    Route::get('/submit', function () {
        return Inertia::render('SubmissionForm');
    });

    Route::get('/welcome', function () {
        return Inertia::render('WelcomeSplash');
    });

    Route::get('/producer-approval', function () {
        return Inertia::render('ProducerApproval');
    });

    Route::get('/document-upload', function () {
        return Inertia::render('DocumentUpload');
    });

    Route::get('/ocr', function () {
        return Inertia::render('OCRScanner');
    });

    Route::get('/review', function () {
        return Inertia::render('Review');
    });
});

Route::middleware(['admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('AdminDashboard');
    });
    Route::get('/admin/submissions', function () {
        return Inertia::render('AdminSubmissions');
    });
    Route::get('/admin/submissions/data', [\App\Http\Controllers\SubmissionDraftController::class, 'adminData']);
    Route::get('/admin/submissions/{submission}/files/{index}/download', [\App\Http\Controllers\SubmissionDraftController::class, 'download']);
    Route::get('/admin/producers', function () {
        return Inertia::render('AdminProducers');
    });
    Route::get('/admin/producers/data', [\App\Http\Controllers\ProducerController::class, 'data']);
    Route::post('/admin/producers', [\App\Http\Controllers\ProducerController::class, 'store']);
    Route::put('/admin/producers/{producer}', [\App\Http\Controllers\ProducerController::class, 'update']);
    Route::delete('/admin/producers/{producer}', [\App\Http\Controllers\ProducerController::class, 'destroy']);
});

Route::post('/auth/send-code', [\App\Http\Controllers\AuthController::class, 'sendCode']);
Route::post('/auth/verify', [\App\Http\Controllers\AuthController::class, 'verify']);
Route::post('/auth/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
Route::post('/auth/admin/send-code', [\App\Http\Controllers\AuthController::class, 'adminSendCode']);
Route::post('/auth/admin/verify', [\App\Http\Controllers\AuthController::class, 'adminVerify']);
Route::post('/auth/admin/logout', [\App\Http\Controllers\AuthController::class, 'adminLogout']);

Route::middleware('verified')->group(function () {
    Route::post('/drafts/step1', [\App\Http\Controllers\SubmissionDraftController::class, 'step1']);
    Route::post('/drafts/files', [\App\Http\Controllers\SubmissionDraftController::class, 'files']);
    Route::post('/drafts/ocr', [\App\Http\Controllers\SubmissionDraftController::class, 'ocr']);
    Route::post('/drafts/submit', [\App\Http\Controllers\SubmissionDraftController::class, 'submit']);
    Route::get('/drafts/me', [\App\Http\Controllers\SubmissionDraftController::class, 'me']);
    Route::get('/drafts/list', [\App\Http\Controllers\SubmissionDraftController::class, 'list']);
    Route::get('/producers/list', [\App\Http\Controllers\ProducerController::class, 'list']);
});

// Signed review links for producers (no authentication required)
Route::get('/producer/drafts/{submission}/accept', [\App\Http\Controllers\SubmissionDraftController::class, 'accept'])
    ->name('drafts.producer.accept')
    ->middleware('signed');
Route::get('/producer/drafts/{submission}/reject', [\App\Http\Controllers\SubmissionDraftController::class, 'reject'])
    ->name('drafts.producer.reject')
    ->middleware('signed');

Route::get('/drafts/{submission}/files/{index}/download', [\App\Http\Controllers\SubmissionDraftController::class, 'download'])
    ->name('drafts.file.download')
    ->middleware('signed');

// Finance review links (no authentication required, signed)
Route::get('/finance/drafts/{submission}/accept', [\App\Http\Controllers\SubmissionDraftController::class, 'financeAccept'])
    ->name('drafts.finance.accept')
    ->middleware('signed');
Route::get('/finance/drafts/{submission}/reject', [\App\Http\Controllers\SubmissionDraftController::class, 'financeReject'])
    ->name('drafts.finance.reject')
    ->middleware('signed');
