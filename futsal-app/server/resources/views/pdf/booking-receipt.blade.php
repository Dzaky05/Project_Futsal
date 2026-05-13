<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bukti Pemesanan #{{ $booking->id }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; }
        .header { background: #166534; color: white; padding: 20px 30px; }
        .header h1 { font-size: 20px; margin-bottom: 4px; }
        .header p { font-size: 11px; opacity: 0.85; }
        .content { padding: 25px 30px; }
        .section { margin-bottom: 20px; }
        .section-title {
            font-size: 13px; font-weight: bold; color: #166534;
            border-bottom: 2px solid #166534; padding-bottom: 5px; margin-bottom: 12px;
        }
        table { width: 100%; border-collapse: collapse; }
        table td { padding: 6px 0; vertical-align: top; }
        table td:first-child { width: 40%; color: #666; }
        table td:last-child { font-weight: 500; }
        .total-row { background: #f0fdf4; }
        .total-row td { padding: 10px; font-size: 14px; font-weight: bold; color: #166534; }
        .status-badge {
            display: inline-block; padding: 3px 10px; border-radius: 12px;
            font-size: 10px; font-weight: bold; text-transform: uppercase;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #d1fae5; color: #065f46; }
        .status-completed { background: #dbeafe; color: #1e40af; }
        .status-cancelled { background: #fecaca; color: #991b1b; }
        .status-menunggu { background: #fef3c7; color: #92400e; }
        .status-lunas { background: #d1fae5; color: #065f46; }
        .status-ditolak { background: #fecaca; color: #991b1b; }
        .footer {
            margin-top: 30px; padding-top: 15px;
            border-top: 1px solid #e5e7eb; text-align: center;
            font-size: 10px; color: #9ca3af;
        }
        .watermark {
            position: fixed; top: 40%; left: 15%;
            font-size: 50px; color: rgba(22, 101, 52, 0.08);
            transform: rotate(-30deg); font-weight: bold;
            z-index: -1;
        }
        .divider { border: none; border-top: 1px dashed #d1d5db; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="watermark">
        @if($booking->payment && $booking->payment->status === 'lunas')
            DIKONFIRMASI
        @else
            MENUNGGU VERIFIKASI
        @endif
    </div>

    <div class="header">
        <h1>⚽ FutsalGo</h1>
        <p>Bukti Pemesanan & Pembayaran</p>
    </div>

    <div class="content">
        <div class="section">
            <div class="section-title">DETAIL PEMESANAN</div>
            <table>
                <tr><td>Booking ID</td><td>#BK-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }}</td></tr>
                <tr><td>Nama Lapangan</td><td>{{ $booking->field->name }}</td></tr>
                <tr><td>Nama Pemesan</td><td>{{ $booking->user->name }}</td></tr>
                <tr><td>Tanggal</td><td>{{ \Carbon\Carbon::parse($booking->booking_date)->locale('id')->isoFormat('dddd, D MMMM Y') }}</td></tr>
                <tr><td>Jam Mulai</td><td>{{ $booking->start_time }} WIB</td></tr>
                <tr><td>Jam Selesai</td><td>{{ $booking->end_time }} WIB</td></tr>
                <tr><td>Durasi</td><td>{{ $booking->duration_hours }} Jam</td></tr>
                <tr>
                    <td>Status Booking</td>
                    <td>
                        <span class="status-badge status-{{ $booking->status }}">
                            {{ strtoupper($booking->status) }}
                        </span>
                    </td>
                </tr>
                @if($booking->notes)
                <tr><td>Catatan</td><td>{{ $booking->notes }}</td></tr>
                @endif
            </table>
        </div>

        <hr class="divider">

        @if($booking->payment)
        <div class="section">
            <div class="section-title">DETAIL PEMBAYARAN</div>
            <table>
                <tr><td>Payment ID</td><td>#PY-{{ str_pad($booking->payment->id, 5, '0', STR_PAD_LEFT) }}</td></tr>
                <tr>
                    <td>Metode Pembayaran</td>
                    <td>
                        @switch($booking->payment->payment_method)
                            @case('transfer_bca') Transfer Bank BCA @break
                            @case('transfer_mandiri') Transfer Bank Mandiri @break
                            @case('transfer_bri') Transfer Bank BRI @break
                            @case('qris') QRIS @break
                            @case('cash') Tunai / Cash @break
                        @endswitch
                    </td>
                </tr>
                <tr><td>Tanggal Bayar</td><td>{{ \Carbon\Carbon::parse($booking->payment->payment_date)->locale('id')->isoFormat('D MMMM Y') }}</td></tr>
                <tr>
                    <td>Status Pembayaran</td>
                    <td>
                        @php
                            $pStatus = str_replace('_', '', $booking->payment->status);
                            $statusClass = match($booking->payment->status) {
                                'lunas' => 'status-lunas',
                                'ditolak' => 'status-ditolak',
                                default => 'status-menunggu',
                            };
                        @endphp
                        <span class="status-badge {{ $statusClass }}">
                            {{ strtoupper(str_replace('_', ' ', $booking->payment->status)) }}
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <hr class="divider">
        @endif

        <div class="section">
            <table>
                <tr class="total-row">
                    <td>TOTAL PEMBAYARAN</td>
                    <td>Rp {{ number_format($booking->total_price, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Dicetak pada: {{ \Carbon\Carbon::now()->locale('id')->isoFormat('dddd, D MMMM Y HH:mm') }} WIB</p>
            <p style="margin-top: 5px; color: #166534; font-weight: bold;">Terima kasih telah memesan di FutsalGo! ⚽</p>
        </div>
    </div>
</body>
</html>
