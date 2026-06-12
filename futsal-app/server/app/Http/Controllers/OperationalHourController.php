<?php

namespace App\Http\Controllers;

use App\Models\OperationalHour;
use Illuminate\Http\Request;

class OperationalHourController extends Controller
{
    public function index(Request $request, $fieldId)
    {
        $query = OperationalHour::where('field_id', $fieldId);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $hours = $query->orderBy('date')->get();
        return response()->json($hours);
    }

    public function update(Request $request, $fieldId)
    {
        $request->validate([
            'hours' => 'required|array',
            'hours.*.date' => 'required|date',
            'hours.*.open_time' => 'required|date_format:H:i',
            'hours.*.close_time' => 'required|date_format:H:i|after:hours.*.open_time',
            'hours.*.is_open' => 'required|boolean',
        ]);

        foreach ($request->hours as $hourData) {
            OperationalHour::updateOrCreate(
                [
                    'field_id' => $fieldId,
                    'date' => $hourData['date'],
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
            'hours' => OperationalHour::where('field_id', $fieldId)
                        ->whereIn('date', collect($request->hours)->pluck('date'))
                        ->orderBy('date')->get(),
        ]);
    }
}
