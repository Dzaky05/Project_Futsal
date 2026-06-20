<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function monthly(Request $request)
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        // Get all bookings for the month (regardless of payment status)
        $bookings = Booking::with(['field', 'user', 'payment'])
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->get();

        $totalBookings = $bookings->count();
        $completedBookings = $bookings->where('status', 'completed')->count();
        $confirmedBookings = $bookings->where('status', 'confirmed')->count();
        $cancelledBookings = $bookings->where('status', 'cancelled')->count();
        $pendingBookings = $bookings->where('status', 'pending')->count();

        // Get payments that are verified (lunas) for this month
        $payments = Payment::with(['booking.field', 'user'])
            ->where('status', 'lunas')
            ->where(function ($query) use ($month, $year) {
                // Match by verified_at OR payment_date
                $query->where(function ($q) use ($month, $year) {
                    $q->whereNotNull('verified_at')
                      ->whereMonth('verified_at', $month)
                      ->whereYear('verified_at', $year);
                })->orWhere(function ($q) use ($month, $year) {
                    $q->whereNull('verified_at')
                      ->whereMonth('payment_date', $month)
                      ->whereYear('payment_date', $year);
                });
            })
            ->orderBy('verified_at', 'desc')
            ->get();

        // Also include payments matched by booking_date
        $paymentsByBooking = Payment::with(['booking.field', 'user'])
            ->where('status', 'lunas')
            ->whereHas('booking', function ($q) use ($month, $year) {
                $q->whereMonth('booking_date', $month)
                  ->whereYear('booking_date', $year);
            })
            ->get();

        // Merge and deduplicate
        $allPayments = $payments->merge($paymentsByBooking)->unique('id');

        $totalRevenue = $allPayments->sum(function ($p) {
            return abs(floatval($p->amount));
        });

        // Revenue by payment method
        $byMethod = [];
        foreach ($allPayments->groupBy('payment_method') as $method => $group) {
            $byMethod[$method] = $group->sum(function ($p) {
                return abs(floatval($p->amount));
            });
        }

        // Daily revenue for chart - group by date
        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $dailyRevenue = [];
        
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dateStr = sprintf('%04d-%02d-%02d', $year, $month, $day);
            $dailyRevenue[$dateStr] = 0;
        }

        foreach ($allPayments as $payment) {
            $date = null;
            if ($payment->verified_at) {
                $date = Carbon::parse($payment->verified_at)->format('Y-m-d');
            } elseif ($payment->payment_date) {
                $date = Carbon::parse($payment->payment_date)->format('Y-m-d');
            }
            
            if ($date && isset($dailyRevenue[$date])) {
                $dailyRevenue[$date] += abs(floatval($payment->amount));
            }
        }

        // Transactions list for table
        $transactions = $allPayments->map(function ($p) {
            return [
                'id' => $p->id,
                'user' => $p->user ? ['name' => $p->user->name] : null,
                'booking' => $p->booking ? [
                    'field' => $p->booking->field ? ['name' => $p->booking->field->name] : null,
                    'booking_date' => $p->booking->booking_date?->format('Y-m-d'),
                    'start_time' => $p->booking->start_time,
                    'end_time' => $p->booking->end_time,
                ] : null,
                'payment_method' => $p->payment_method,
                'amount' => floatval($p->amount),
                'payment_date' => $p->verified_at
                    ? Carbon::parse($p->verified_at)->format('Y-m-d')
                    : ($p->payment_date ? Carbon::parse($p->payment_date)->format('Y-m-d') : null),
                'status' => $p->status,
            ];
        })->values();

        return response()->json([
            'data' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'total_revenue' => $totalRevenue,
                'total_bookings' => $totalBookings,
                'completed_bookings' => $completedBookings + $confirmedBookings,
                'cancelled_bookings' => $cancelledBookings,
                'pending_bookings' => $pendingBookings,
                'by_method' => $byMethod,
                'daily_revenue' => $dailyRevenue,
                'transactions' => $transactions,
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $payments = Payment::with(['booking.field', 'user'])
            ->where('status', 'lunas')
            ->where(function ($query) use ($month, $year) {
                $query->where(function ($q) use ($month, $year) {
                    $q->whereNotNull('verified_at')
                      ->whereMonth('verified_at', $month)
                      ->whereYear('verified_at', $year);
                })->orWhere(function ($q) use ($month, $year) {
                    $q->whereNull('verified_at')
                      ->whereMonth('payment_date', $month)
                      ->whereYear('payment_date', $year);
                });
            })
            ->orderBy('verified_at', 'desc')
            ->get();

        $paymentsByBooking = Payment::with(['booking.field', 'user'])
            ->where('status', 'lunas')
            ->whereHas('booking', function ($q) use ($month, $year) {
                $q->whereMonth('booking_date', $month)
                  ->whereYear('booking_date', $year);
            })
            ->get();

        $allPayments = $payments->merge($paymentsByBooking)->unique('id');

        $totalRevenue = $allPayments->sum(function ($p) {
            return abs(floatval($p->amount));
        });

        $pdf = Pdf::loadView('pdf.financial-report', [
            'payments' => $allPayments,
            'totalRevenue' => $totalRevenue,
            'month' => $month,
            'year' => $year,
        ]);

        $pdf->setPaper('A4', 'landscape');
        $monthName = Carbon::create($year, $month)->locale('id')->isoFormat('MMMM');

        return $pdf->download("laporan-keuangan-{$monthName}-{$year}.pdf");
    }
}
