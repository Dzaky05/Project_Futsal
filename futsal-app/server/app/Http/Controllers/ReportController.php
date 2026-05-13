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

        $payments = Payment::with(['booking.field', 'user'])
            ->where('status', 'lunas')
            ->whereMonth('verified_at', $month)
            ->whereYear('verified_at', $year)
            ->orderBy('verified_at', 'desc')
            ->get();

        $totalRevenue = $payments->sum('amount');
        $totalTransactions = $payments->count();

        // Revenue by payment method
        $byMethod = $payments->groupBy('payment_method')->map(function ($group) {
            return [
                'count' => $group->count(),
                'total' => $group->sum('amount'),
            ];
        });

        // Daily revenue for chart
        $dailyRevenue = $payments->groupBy(function ($p) {
            return Carbon::parse($p->verified_at)->format('Y-m-d');
        })->map(function ($group, $date) {
            return [
                'date' => $date,
                'total' => $group->sum('amount'),
                'count' => $group->count(),
            ];
        })->values();

        return response()->json([
            'month' => $month,
            'year' => $year,
            'total_revenue' => $totalRevenue,
            'total_transactions' => $totalTransactions,
            'by_method' => $byMethod,
            'daily_revenue' => $dailyRevenue,
            'payments' => $payments,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $payments = Payment::with(['booking.field', 'user'])
            ->where('status', 'lunas')
            ->whereMonth('verified_at', $month)
            ->whereYear('verified_at', $year)
            ->orderBy('verified_at', 'desc')
            ->get();

        $totalRevenue = $payments->sum('amount');

        $pdf = Pdf::loadView('pdf.financial-report', [
            'payments' => $payments,
            'totalRevenue' => $totalRevenue,
            'month' => $month,
            'year' => $year,
        ]);

        $pdf->setPaper('A4', 'landscape');
        $monthName = Carbon::create($year, $month)->locale('id')->isoFormat('MMMM');

        return $pdf->download("laporan-keuangan-{$monthName}-{$year}.pdf");
    }
}
