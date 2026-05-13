<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price_per_hour',
        'image',
        'facilities',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'facilities' => 'array',
            'price_per_hour' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function blockedSlots()
    {
        return $this->hasMany(BlockedSlot::class);
    }

    public function operationalHours()
    {
        return $this->hasMany(OperationalHour::class);
    }
}
