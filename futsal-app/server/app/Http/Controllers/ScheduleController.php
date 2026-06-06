<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\Booking;
use App\Models\BlockedSlot;
use App\Models\OperationalHour;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function getWeeklySchedule(Request $request)
    {
        $request->validate([
            'field_id' => 'required|exists:fields,id',
            'start_date' => 'required|date',
        ]);

        $fieldId = $request->field_id;
        $startDate = Carbon::parse($request->start_date)->startOfWeek(Carbon::MONDAY);
        $endDate = $startDate->copy()->endOfWeek(Carbon::SUNDAY);

        $field = Field::with('operationalHours')->findOrFail($fieldId);

        // Get bookings for this week
        $bookings = Booking::where('field_id', $fieldId)
            ->whereBetween('booking_date', [$startDate, $endDate])
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        // Get blocked slots for this week
        $blockedSlots = BlockedSlot::where('field_id', $fieldId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        // Build schedule grid
        $schedule = [];
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $opHours = $field->operationalHours->firstWhere('date', $date->format('Y-m-d'));

            if (!$opHours || !$opHours->is_open) {
                $schedule[] = [
                    'date' => $date->format('Y-m-d'),
                    'day_name' => $date->locale('id')->isoFormat('dddd'),
                    'is_open' => false,
                    'slots' => [],
                ];
                continue;
            }

            $openTime = Carbon::parse($opHours->open_time);
            $closeTime = Carbon::parse($opHours->close_time);
            $slots = [];

            for ($time = $openTime->copy(); $time->lt($closeTime); $time->addHour()) {
                $slotStart = $time->format('H:i');
                $slotEnd = $time->copy()->addHour()->format('H:i');
                $currentDate = $date->format('Y-m-d');

                // Check if booked — normalize time formats to H:i for consistent comparison
                // Use >= so that the end_time slot is also marked as booked
                $isBooked = $bookings->first(function ($b) use ($currentDate, $slotStart) {
                    $bStart = Carbon::parse($b->start_time)->format('H:i');
                    $bEnd   = Carbon::parse($b->end_time)->format('H:i');
                    return $b->booking_date->format('Y-m-d') === $currentDate
                        && $bStart <= $slotStart
                        && $bEnd >= $slotStart;
                });

                // Check if blocked — normalize time formats to H:i
                // Use >= so that the end_time slot is also marked as blocked
                $isBlocked = $blockedSlots->first(function ($bs) use ($currentDate, $slotStart) {
                    $bsStart = Carbon::parse($bs->start_time)->format('H:i');
                    $bsEnd   = Carbon::parse($bs->end_time)->format('H:i');
                    return $bs->date->format('Y-m-d') === $currentDate
                        && $bsStart <= $slotStart
                        && $bsEnd >= $slotStart;
                });

                // Check if past
                $isPast = Carbon::parse("$currentDate $slotStart")->lt(Carbon::now());

                $status = 'available';
                $reason = null;

                if ($isPast) {
                    $status = 'past';
                } elseif ($isBlocked) {
                    $status = 'blocked';
                    $reason = $isBlocked->reason;
                } elseif ($isBooked) {
                    $status = 'booked';
                }

                $slots[] = [
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                    'status' => $status,
                    'reason' => $reason,
                ];
            }

            $schedule[] = [
                'date' => $date->format('Y-m-d'),
                'day_name' => $date->locale('id')->isoFormat('dddd'),
                'is_open' => true,
                'slots' => $slots,
            ];
        }

        return response()->json([
            'field' => $field,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'schedule' => $schedule,
        ]);
    }

    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'field_id' => 'required|exists:fields,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $fieldId = $request->field_id;
        $date = Carbon::parse($request->date);
        $field = Field::findOrFail($fieldId);
        $opHours = OperationalHour::where('field_id', $fieldId)
            ->where('date', $date->format('Y-m-d'))
            ->first();

        if (!$opHours || !$opHours->is_open) {
            return response()->json([
                'message' => 'Lapangan tutup pada hari ini.',
                'slots' => [],
            ]);
        }

        $bookings = Booking::where('field_id', $fieldId)
            ->where('booking_date', $date->format('Y-m-d'))
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        $blockedSlots = BlockedSlot::where('field_id', $fieldId)
            ->where('date', $date->format('Y-m-d'))
            ->get();

        $openTime = Carbon::parse($opHours->open_time);
        $closeTime = Carbon::parse($opHours->close_time);
        $slots = [];

        for ($time = $openTime->copy(); $time->lt($closeTime); $time->addHour()) {
            $slotStart = $time->format('H:i');
            $slotEnd = $time->copy()->addHour()->format('H:i');

            $isBooked = $bookings->contains(function ($b) use ($slotStart) {
                $bStart = Carbon::parse($b->start_time)->format('H:i');
                $bEnd   = Carbon::parse($b->end_time)->format('H:i');
                return $bStart <= $slotStart && $bEnd >= $slotStart;
            });

            $isBlocked = $blockedSlots->contains(function ($bs) use ($slotStart) {
                $bsStart = Carbon::parse($bs->start_time)->format('H:i');
                $bsEnd   = Carbon::parse($bs->end_time)->format('H:i');
                return $bsStart <= $slotStart && $bsEnd >= $slotStart;
            });

            $isPast = Carbon::parse("{$date->format('Y-m-d')} $slotStart")->lt(Carbon::now());

            if (!$isBooked && !$isBlocked && !$isPast) {
                $slots[] = [
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                ];
            }
        }

        return response()->json([
            'field' => $field,
            'date' => $date->format('Y-m-d'),
            'slots' => $slots,
        ]);
    }

    public function deleteSlot(Request $request)
    {
        $request->validate([
            'field_id' => 'required|exists:fields,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'type' => 'required|in:booked,blocked',
        ]);

        $dateStr = Carbon::parse($request->date)->format('Y-m-d');
        $startTime = Carbon::parse($request->start_time)->format('H:i:s');

        if ($request->type === 'blocked') {
            $deleted = BlockedSlot::where('field_id', $request->field_id)
                ->where('date', $dateStr)
                ->where('start_time', '<=', $startTime)
                ->where('end_time', '>', $startTime)
                ->delete();
                
            if ($deleted) {
                return response()->json(['message' => 'Blokir slot berhasil dihapus!']);
            }
        } elseif ($request->type === 'booked') {
            // Find bookings that overlap with this time
            $booking = Booking::where('field_id', $request->field_id)
                ->where('booking_date', $dateStr)
                ->where('start_time', '<=', $startTime)
                ->where('end_time', '>', $startTime)
                ->first();
                
            if ($booking) {
                $booking->status = 'cancelled';
                $booking->save();
                return response()->json(['message' => 'Booking berhasil dibatalkan!']);
            }
        }

        return response()->json(['message' => 'Slot tidak ditemukan.'], 404);
    }
}
