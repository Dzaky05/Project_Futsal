<?php

namespace App\Http\Controllers;

use App\Models\BlockedSlot;
use Illuminate\Http\Request;

class BlockedSlotController extends Controller
{
    public function index(Request $request)
    {
        $query = BlockedSlot::with(['field', 'creator']);

        if ($request->has('field_id')) {
            $query->where('field_id', $request->field_id);
        }
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'field_id' => 'required|exists:fields,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'reason' => 'required|in:maintenance,event,rest',
            'description' => 'nullable|string',
        ]);

        $blocked = BlockedSlot::create([
            'field_id' => $request->field_id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'reason' => $request->reason,
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Slot berhasil diblokir!',
            'blocked_slot' => $blocked->load('field'),
        ], 201);
    }

    public function destroy($id)
    {
        $blocked = BlockedSlot::findOrFail($id);
        $blocked->delete();

        return response()->json(['message' => 'Blokir slot berhasil dihapus!']);
    }
}
