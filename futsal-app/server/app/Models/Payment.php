<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'payment_method',
        'payment_date',
        'amount',
        'payment_proof',
        'status',
        'verified_by',
        'verified_at',
        'notes',
        'is_deposit',
        'deposit_amount',
        'remaining_amount',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'is_deposit' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
