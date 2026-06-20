<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'field_id',
        'user_id',
        'booking_date',
        'start_time',
        'end_time',
        'duration_hours',
        'total_price',
        'status',
        'notes',
        'reminder_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'duration_hours' => 'decimal:1',
            'total_price' => 'decimal:2',
            'reminder_sent_at' => 'datetime',
        ];
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public static function autoUpdateCompletedStatuses()
    {
        $now = \Carbon\Carbon::now();
        self::where('status', 'confirmed')
            ->where(function ($query) use ($now) {
                $query->where('booking_date', '<', $now->toDateString())
                      ->orWhere(function ($q) use ($now) {
                          $q->where('booking_date', '=', $now->toDateString())
                            ->where('end_time', '<=', $now->toTimeString());
                      });
            })
            ->update(['status' => 'completed']);
    }
}
