<?php

namespace App\Http\Controllers;

use App\Models\OperationalHour;
use Illuminate\Http\Request;

class OperationalHourController extends Controller
{
    public function index($fieldId)
    {
        $hours = OperationalHour::where('field_id', $fieldId)
            ->orderBy('day_of_week')
            ->get();

        return response()->json($hours);
    }

    public function update(Request $request, $fieldId)
    {
        $request->validate([
            'hours' => 'required|array',
            'hours.*.day_of_week' => 'required|integer|between:0,6',
            'hours.*.open_time' => 'required|date_format:H:i',
            'hours.*.close_time' => 'required|date_format:H:i|after:hours.*.open_time',
            'hours.*.is_open' => 'required|boolean',
        ]);

        foreach ($request->hours as $hourData) {
            OperationalHour::updateOrCreate(
                [
                    'field_id' => $fieldId,
                    'day_of_week' => $hourData['day_of_week'],
                ],
                [
                    'open_time' => $hourData['open_time'],
                    'close_time' => $hourData['close_time'],
                    'is_open' => $hourData['is_open'],
                ]
            );
        }

        return response()->json([
            'message' => 'Jam operasional berhasil diperbarui!',
            'hours' => OperationalHour::where('field_id', $fieldId)->orderBy('day_of_week')->get(),
        ]);
    }
}
