<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status Pembayaran FutsalGo</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; background: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: #16a34a; color: #ffffff; padding: 24px;">
            <h1 style="margin: 0; font-size: 22px;">Status Pembayaran Anda</h1>
        </div>
        <div style="padding: 24px;">
            <p>Halo {{ $payment->user->name }},</p>
            @if($payment->status === 'lunas')
                <p>Pembayaran untuk booking #{{ $payment->booking_id }} telah dinyatakan <strong>Lunas</strong>.</p>
                <p>Booking Anda saat ini berstatus <strong>Dikonfirmasi</strong>.</p>
            @else
                <p>Pembayaran untuk booking #{{ $payment->booking_id }} ditolak.</p>
                <p>Silakan unggah ulang bukti pembayaran dan pastikan informasi pembayaran sudah benar.</p>
            @endif
            <p><strong>Metode:</strong> {{ strtoupper(str_replace('_', ' ', $payment->payment_method)) }}</p>
            <p><strong>Jumlah:</strong> Rp {{ number_format($payment->amount, 0, ',', '.') }}</p>
            @if($payment->notes)
                <p><strong>Catatan admin:</strong> {{ $payment->notes }}</p>
            @endif
            <p style="margin-top: 24px;">Salam,<br>Tim FutsalGo</p>
        </div>
    </div>
</body>
</html>
