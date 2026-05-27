<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class PaymentStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function build()
    {
        $statusLabel = $this->payment->status === 'lunas' ? 'Lunas' : 'Ditolak';
        return $this->subject("Status Pembayaran FutsalGo: {$statusLabel} - #{$this->payment->booking_id}")
            ->view('emails.payment-status')
            ->with(['payment' => $this->payment]);
    }
}
