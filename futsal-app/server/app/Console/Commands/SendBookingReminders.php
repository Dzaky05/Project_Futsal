<?php

namespace App\Console\Commands;

use App\Mail\BookingReminder;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendBookingReminders extends Command
{
    protected $signature = 'booking:send-reminders';

    protected $description = 'Send reminder emails for confirmed bookings that are starting soon';

    public function handle(): int
    {
        $now = Carbon::now();
        $windowEnd = $now->copy()->addHours(24);

        $bookings = Booking::with(['field', 'user'])
            ->where('status', 'confirmed')
            ->whereNull('reminder_sent_at')
            ->where('booking_date', '>=', $now->toDateString())
            ->get();

        $sent = 0;

        foreach ($bookings as $item) {
            /** @var Booking $booking */
            $booking = $item;

            $startAt = Carbon::parse($booking->booking_date)->setTimeFromTimeString($booking->start_time);

            if (!$startAt->between($now, $windowEnd)) {
                continue;
            }
            try {
                Mail::to($booking->user->email)->send(new BookingReminder($booking));
                $booking->forceFill(['reminder_sent_at' => now()])->saveQuietly();
                $sent++;
            } catch (\Throwable $e) {
                $this->warn('Gagal mengirim reminder untuk booking #' . $booking->id . ': ' . $e->getMessage());
            }
        }

        $this->info('Reminder terkirim: ' . $sent);

        return self::SUCCESS;
    }
}
