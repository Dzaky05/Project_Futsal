<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\BlockedSlotController;
use App\Http\Controllers\OperationalHourController;
use App\Http\Controllers\ReportController;

// ===== PUBLIC ROUTES =====
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

// Public: list active fields
Route::get('/fields', [FieldController::class, 'index']);
Route::get('/fields/{id}', [FieldController::class, 'show']);

// Public: schedule
Route::get('/schedule/weekly', [ScheduleController::class, 'getWeeklySchedule']);
Route::get('/schedule/available', [ScheduleController::class, 'getAvailableSlots']);

// ===== AUTHENTICATED USER ROUTES =====
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::get('/bookings/{id}/pdf', [BookingController::class, 'downloadPdf']);

    // Upload payment proof (re-upload)
    Route::post('/payments/{id}/upload-proof', [PaymentController::class, 'uploadProof']);
});

// ===== ADMIN ROUTES =====
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [BookingController::class, 'todayStats']);

    // Manage Bookings
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::put('/payments/{id}/verify', [PaymentController::class, 'verify']);
    Route::get('/payments/{id}/proof', [PaymentController::class, 'getProofImage']);

    // Fields Management
    Route::get('/fields', [FieldController::class, 'all']);
    Route::post('/fields', [FieldController::class, 'store']);
    Route::put('/fields/{id}', [FieldController::class, 'update']);
    Route::post('/fields/{id}/image', [FieldController::class, 'uploadImage']);
    Route::delete('/fields/{id}', [FieldController::class, 'destroy']);

    // Operational Hours
    Route::get('/fields/{fieldId}/hours', [OperationalHourController::class, 'index']);
    Route::put('/fields/{fieldId}/hours', [OperationalHourController::class, 'update']);

    // Blocked Slots
    Route::get('/blocked-slots', [BlockedSlotController::class, 'index']);
    Route::post('/blocked-slots', [BlockedSlotController::class, 'store']);
    Route::delete('/blocked-slots/{id}', [BlockedSlotController::class, 'destroy']);

    // Reports
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf']);
});
