<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Field;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_review_for_completed_booking(): void
    {
        $user = User::factory()->create();
        $field = Field::create([
            'name' => 'Lapangan Review',
            'description' => 'Untuk test review',
            'price_per_hour' => 120000,
            'facilities' => ['Lampu'],
            'is_active' => true,
        ]);

        $booking = Booking::create([
            'field_id' => $field->id,
            'user_id' => $user->id,
            'booking_date' => now()->subDay(),
            'start_time' => '18:00',
            'end_time' => '20:00',
            'duration_hours' => 2,
            'total_price' => 240000,
            'status' => 'completed',
            'notes' => 'Selesai',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reviews', [
                'booking_id' => $booking->id,
                'rating' => 5,
                'comment' => 'Lapangan bersih dan nyaman.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('review.booking_id', $booking->id)
            ->assertJsonPath('review.user_id', $user->id)
            ->assertJsonPath('review.rating', 5)
            ->assertJsonPath('review.comment', 'Lapangan bersih dan nyaman.');
    }
}
