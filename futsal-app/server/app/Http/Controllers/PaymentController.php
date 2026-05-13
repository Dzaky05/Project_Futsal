<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['booking.field', 'user', 'verifier']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        if ($request->has('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($payments);
    }

    public function verify(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:lunas,ditolak',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::with('booking')->findOrFail($id);
        $payment->update([
            'status' => $request->status,
            'verified_by' => $request->user()->id,
            'verified_at' => Carbon::now(),
            'notes' => $request->notes,
        ]);

        // If approved, auto-confirm booking
        if ($request->status === 'lunas') {
            $payment->booking->update(['status' => 'confirmed']);
        }

        return response()->json([
            'message' => $request->status === 'lunas'
                ? 'Pembayaran berhasil diverifikasi! Booking dikonfirmasi.'
                : 'Pembayaran ditolak. User harus upload ulang bukti.',
            'payment' => $payment->load(['booking.field', 'user']),
        ]);
    }

    public function uploadProof(Request $request, $id)
    {
        $request->validate([
            'payment_proof' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $payment = Payment::findOrFail($id);

        // Ensure user owns this payment
        if ($payment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Delete old proof
        if ($payment->payment_proof) {
            Storage::disk('public')->delete($payment->payment_proof);
        }

        $path = $request->file('payment_proof')->store('payment_proofs', 'public');
        $payment->update([
            'payment_proof' => $path,
            'status' => 'menunggu_verifikasi',
        ]);

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diupload!',
            'payment' => $payment,
        ]);
    }

    public function getProofImage($id)
    {
        $payment = Payment::findOrFail($id);

        if (!$payment->payment_proof) {
            return response()->json(['message' => 'Bukti pembayaran tidak ditemukan.'], 404);
        }

        $path = Storage::disk('public')->path($payment->payment_proof);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return response()->file($path);
    }
}
