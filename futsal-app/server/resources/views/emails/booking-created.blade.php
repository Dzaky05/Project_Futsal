<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pemesanan FutsalGo</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; background: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: #16a34a; color: #ffffff; padding: 24px;">
            <h1 style="margin: 0; font-size: 22px;">Pemesanan Berhasil</h1>
            <p style="margin: 8px 0 0; font-size: 14px;">Booking #{{ $booking->id }} telah dibuat.</p>
        </div>
        <div style="padding: 24px;">
            <p>Halo {{ $booking->user->name }},</p>
            <p>Terima kasih telah memesan lapangan di FutsalGo. Berikut ringkasan pemesanan Anda:</p>
            <ul style="padding-left: 18px; color: #374151;">
                <li><strong>Lapangan:</strong> {{ $booking->field->name }}</li>
                <li><strong>Tanggal:</strong> {{ \Carbon\Carbon::parse($booking->booking_date)->format('d/m/Y') }}</li>
                <li><strong>Waktu:</strong> {{ $booking->start_time }} - {{ $booking->end_time }}</li>
                <li><strong>Durasi:</strong> {{ $booking->duration_hours }} jam</li>
                <li><strong>Total:</strong> Rp {{ number_format($booking->total_price, 0, ',', '.') }}</li>
                <li><strong>Status pembayaran:</strong> {{ $booking->payment->status }}</li>
            </ul>
            <p>Silakan tunggu verifikasi pembayaran dari admin jika diperlukan.</p>
            <p style="margin-top: 24px;">Salam,<br>Tim FutsalGo</p>
        </div>
    </div>
</body>
</html>
