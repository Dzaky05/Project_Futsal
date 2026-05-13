<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlockedSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'field_id',
        'date',
        'start_time',
        'end_time',
        'reason',
        'description',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
