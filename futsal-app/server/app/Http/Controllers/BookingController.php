<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Field;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'field_id' => 'required|exists:fields,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:transfer_bca,transfer_mandiri,transfer_bri,qris,cash',
            'payment_proof' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'payment_notes' => 'nullable|string',
        ]);

        $field = Field::findOrFail($request->field_id);

        // Calculate duration and price
        $start = Carbon::parse($request->start_time);
        $end = Carbon::parse($request->end_time);
        $durationHours = $end->diffInMinutes($start) / 60;
        $totalPrice = $durationHours * $field->price_per_hour;

        // Check for conflicting bookings
        $conflict = Booking::where('field_id', $request->field_id)
            ->where('booking_date', $request->booking_date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($request) {
                $q->where(function ($q2) use ($request) {
                    $q2->where('start_time', '<', $request->end_time)
                        ->where('end_time', '>', $request->start_time);
                });
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Slot waktu ini sudah dipesan. Silakan pilih waktu lain.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create booking
            $booking = Booking::create([
                'field_id' => $request->field_id,
                'user_id' => $request->user()->id,
                'booking_date' => $request->booking_date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'duration_hours' => $durationHours,
                'total_price' => $totalPrice,
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Handle payment proof upload
            $proofPath = null;
            if ($request->hasFile('payment_proof')) {
                $proofPath = $request->file('payment_proof')->store('payment_proofs', 'public');
            }

            // Create payment
            $paymentStatus = $request->payment_method === 'cash'
                ? 'menunggu_verifikasi'
                : 'menunggu_verifikasi';

            $payment = Payment::create([
                'booking_id' => $booking->id,
                'user_id' => $request->user()->id,
                'payment_method' => $request->payment_method,
                'payment_date' => Carbon::today(),
                'amount' => $totalPrice,
                'payment_proof' => $proofPath,
                'status' => $paymentStatus,
                'notes' => $request->payment_notes,
            ]);

            DB::commit();

            $booking->load(['field', 'user', 'payment']);

            return response()->json([
                'message' => 'Pemesanan berhasil dibuat! Menunggu verifikasi admin.',
                'booking' => $booking,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat pemesanan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Booking::with(['field', 'user', 'payment']);

        // If not admin, only show own bookings
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('field_id')) {
            $query->where('field_id', $request->field_id);
        }
        if ($request->has('date_from')) {
            $query->where('booking_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('booking_date', '<=', $request->date_to);
        }
        if ($request->has('payment_status') && $user->isAdmin()) {
            $query->whereHas('payment', function ($q) use ($request) {
                $q->where('status', $request->payment_status);
            });
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(15);

        return response()->json($bookings);
    }

    public function show(Request $request, $id)
    {
        $booking = Booking::with(['field', 'user', 'payment.verifier'])->findOrFail($id);

        // Users can only see their own bookings
        if (!$request->user()->isAdmin() && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json($booking);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status pemesanan berhasil diperbarui!',
            'booking' => $booking->load(['field', 'user', 'payment']),
        ]);
    }

    public function downloadPdf(Request $request, $id)
    {
        $booking = Booking::with(['field', 'user', 'payment'])->findOrFail($id);

        // Users can only download their own PDF
        if (!$request->user()->isAdmin() && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $pdf = Pdf::loadView('pdf.booking-receipt', ['booking' => $booking]);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("bukti-pemesanan-{$booking->id}.pdf");
    }

    public function todayStats()
    {
        $today = Carbon::today();

        return response()->json([
            'total_bookings_today' => Booking::where('booking_date', $today)->count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'pending_payments' => Payment::where('status', 'menunggu_verifikasi')->count(),
            'revenue_today' => Payment::where('status', 'lunas')
                ->whereDate('verified_at', $today)
                ->sum('amount'),
            'revenue_month' => Payment::where('status', 'lunas')
                ->whereMonth('verified_at', $today->month)
                ->whereYear('verified_at', $today->year)
                ->sum('amount'),
            'recent_bookings' => Booking::with(['field', 'user', 'payment'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ]);
    }
}
