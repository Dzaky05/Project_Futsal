<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking)
    {
    }

    public function build(): static
    {
        return $this
            ->subject('Pengingat Jadwal FutsalGo Anda')
            ->view('emails.booking-reminder')
            ->with([
                'booking' => $this->booking,
                'field' => $this->booking->field,
                'user' => $this->booking->user,
            ]);
    }
}
