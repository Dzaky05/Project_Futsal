<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $booking = Booking::where('id', $data['booking_id'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->firstOrFail();

        $review = Review::updateOrCreate(
            ['booking_id' => $booking->id, 'user_id' => $request->user()->id],
            [
                'rating' => $data['rating'],
                'comment' => $data['comment'],
            ]
        );

        return response()->json([
            'message' => 'Ulasan berhasil disimpan.',
            'review' => $review->load(['booking', 'user']),
        ], 201);
    }

    public function indexForField($fieldId)
    {
        $reviews = Review::with(['user', 'booking'])
            ->whereHas('booking', function ($q) use ($fieldId) {
                $q->where('field_id', $fieldId);
            })
            ->latest()
            ->get();

        return response()->json($reviews);
    }
}
