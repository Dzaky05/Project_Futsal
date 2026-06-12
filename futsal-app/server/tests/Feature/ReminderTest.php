<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Field;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_reminder_command_sends_email_for_upcoming_bookings(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'reminder@example.com',
            'name' => 'Reminder User',
        ]);

        $field = Field::create([
            'name' => 'Lapangan Uji',
            'description' => 'Lapangan untuk reminder',
            'price_per_hour' => 120000,
            'facilities' => ['Lampu'],
            'is_active' => true,
        ]);

        $start = Carbon::now()->addHours(2);
        $end = (clone $start)->addHours(2);

        $booking = Booking::create([
            'field_id' => $field->id,
            'user_id' => $user->id,
            'booking_date' => Carbon::today(),
            'start_time' => $start->format('H:i:s'),
            'end_time' => $end->format('H:i:s'),
            'duration_hours' => 2,
            'total_price' => 240000,
            'status' => 'confirmed',
            'notes' => 'Reminder test',
        ]);

        $this->artisan('booking:send-reminders')->assertSuccessful();

        Mail::assertSent(\App\Mail\BookingReminder::class, function ($mail) use ($booking) {
            return $mail->hasTo($booking->user->email);
        });
    }
}
