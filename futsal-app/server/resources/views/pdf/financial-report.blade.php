<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #333; }
        .header { background: #166534; color: white; padding: 20px 25px; }
        .header h1 { font-size: 18px; }
        .header p { font-size: 10px; opacity: 0.85; margin-top: 3px; }
        .content { padding: 20px 25px; }
        .summary { display: flex; margin-bottom: 20px; }
        .summary-box { border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin-right: 15px; min-width: 150px; }
        .summary-box .label { font-size: 9px; color: #666; text-transform: uppercase; }
        .summary-box .value { font-size: 16px; font-weight: bold; color: #166534; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #f0fdf4; color: #166534; padding: 8px 6px; text-align: left; font-size: 10px; border-bottom: 2px solid #166534; }
        td { padding: 6px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        tr:nth-child(even) { background: #fafafa; }
        .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        .total-footer td { font-weight: bold; background: #f0fdf4; color: #166534; font-size: 11px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FutsalGo — Laporan Keuangan</h1>
        <p>Periode: {{ \Carbon\Carbon::create($year, $month)->locale('id')->isoFormat('MMMM Y') }}</p>
    </div>
    <div class="content">
        <table style="margin-bottom:20px; width: auto;">
            <tr>
                <td style="border:1px solid #d1d5db; padding:10px; min-width:150px;">
                    <div style="font-size:9px; color:#666;">TOTAL PENDAPATAN</div>
                    <div style="font-size:16px; font-weight:bold; color:#166534; margin-top:4px;">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</div>
                </td>
                <td style="border:1px solid #d1d5db; padding:10px; min-width:150px;">
                    <div style="font-size:9px; color:#666;">TOTAL TRANSAKSI</div>
                    <div style="font-size:16px; font-weight:bold; color:#166534; margin-top:4px;">{{ $payments->count() }}</div>
                </td>
            </tr>
        </table>

        <h3 style="font-size:12px; color:#166534; margin-bottom:5px;">Detail Transaksi</h3>
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Pelanggan</th>
                    <th>Lapangan</th>
                    <th>Metode</th>
                    <th>Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($payments as $i => $payment)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($payment->verified_at)->format('d/m/Y') }}</td>
                    <td>{{ $payment->user->name }}</td>
                    <td>{{ $payment->booking->field->name ?? '-' }}</td>
                    <td>{{ strtoupper(str_replace('_', ' ', $payment->payment_method)) }}</td>
                    <td>Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                </tr>
                @endforeach
                <tr class="total-footer">
                    <td colspan="5" style="text-align: right;">TOTAL</td>
                    <td>Rp {{ number_format($totalRevenue, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
        <div class="footer">
            <p>Dicetak: {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM Y HH:mm') }} WIB | FutsalGo</p>
        </div>
    </div>
</body>
</html>
