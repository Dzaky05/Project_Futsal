<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengingat Jadwal FutsalGo</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f0fdf4; color: #14532d; margin: 0; padding: 24px;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #bbf7d0;">
        <h2 style="margin-top: 0; color: #166534;">Pengingat Jadwal FutsalGo</h2>
        <p>Halo {{ $user->name ?? 'Pelanggan' }},</p>
        <p>Jadwal sewa lapangan Anda akan segera dimulai. Berikut detailnya:</p>

        <ul style="padding-left: 18px; line-height: 1.5;">
            <li><strong>Lapangan:</strong> {{ $field->name }}</li>
            <li><strong>Tanggal:</strong> {{ \Carbon\Carbon::parse($booking->booking_date)->translatedFormat('d F Y') }}</li>
            <li><strong>Jam:</strong> {{ substr($booking->start_time, 0, 5) }} - {{ substr($booking->end_time, 0, 5) }}</li>
            <li><strong>Status:</strong> {{ ucfirst($booking->status) }}</li>
        </ul>

        <p style="margin-top: 16px;">Pastikan Anda sudah siap 15–30 menit sebelum jadwal dimulai.</p>
        <p style="margin-bottom: 0;">Terima kasih,<br>FutsalGo</p>
    </div>
</body>
</html>
