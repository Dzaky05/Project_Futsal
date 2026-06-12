<?php

namespace Tests\Feature;

use App\Models\Field;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepositTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_deposit_booking(): void
    {
        $user = User::factory()->create();

        $field = Field::create([
            'name' => 'Lapangan DP',
            'description' => 'Untuk test deposit',
            'price_per_hour' => 100000,
            'facilities' => ['Lampu'],
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/bookings', [
                'field_id' => $field->id,
                'booking_date' => now()->addDay()->toDateString(),
                'start_time' => '18:00',
                'end_time' => '20:00',
                'payment_method' => 'cash',
                'notes' => 'Bayar DP',
                'is_deposit' => true,
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('booking.payment.is_deposit', true);
        $response->assertJsonPath('booking.payment.deposit_amount', '100000.00');
        $response->assertJsonPath('booking.payment.amount', '100000.00');
    }
}
