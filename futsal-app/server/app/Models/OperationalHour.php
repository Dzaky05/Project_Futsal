<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperationalHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'field_id',
        'date',
        'open_time',
        'close_time',
        'is_open',
    ];

    protected function casts(): array
    {
        return [
            'is_open' => 'boolean',
        ];
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }
}
