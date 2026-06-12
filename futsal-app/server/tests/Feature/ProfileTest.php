<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_profile_and_password(): void
    {
        $user = User::factory()->create([
            'name' => 'User Lama',
            'email' => 'lama@gmail.com',
            'phone' => '081111111111',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile', [
                'name' => 'User Baru',
                'email' => 'baru@gmail.com',
                'phone' => '082222222222',
                'current_password' => 'password123',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Profil berhasil diperbarui.');
        $response->assertJsonPath('user.name', 'User Baru');
        $response->assertJsonPath('user.email', 'baru@gmail.com');
        $response->assertJsonPath('user.phone', '082222222222');

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }
}
