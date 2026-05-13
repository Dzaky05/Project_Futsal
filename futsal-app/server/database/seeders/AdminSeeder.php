<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Field;
use App\Models\OperationalHour;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin account
        User::updateOrCreate(
            ['email' => 'admin@futsalgo.com'],
            [
                'name' => 'Admin FutsalGo',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '081234567890',
            ]
        );

        // Create sample fields
        $fields = [
            [
                'name' => 'Lapangan A',
                'description' => 'Lapangan futsal indoor dengan rumput sintetis berkualitas tinggi. Dilengkapi dengan pencahayaan LED dan ventilasi yang baik.',
                'price_per_hour' => 150000,
                'facilities' => ['Rumput Sintetis', 'LED Lighting', 'Tribun Penonton', 'Ruang Ganti'],
                'is_active' => true,
            ],
            [
                'name' => 'Lapangan B',
                'description' => 'Lapangan futsal indoor standar nasional dengan lantai vinyl. Cocok untuk latihan dan pertandingan resmi.',
                'price_per_hour' => 175000,
                'facilities' => ['Lantai Vinyl', 'AC', 'Scoring Board', 'Ruang Ganti', 'Tribun VIP'],
                'is_active' => true,
            ],
            [
                'name' => 'Lapangan C',
                'description' => 'Lapangan futsal outdoor dengan rumput sintetis. Suasana terbuka dan nyaman untuk bermain sore-malam.',
                'price_per_hour' => 120000,
                'facilities' => ['Rumput Sintetis', 'Floodlight', 'Parkir Luas'],
                'is_active' => true,
            ],
        ];

        foreach ($fields as $fieldData) {
            $field = Field::updateOrCreate(
                ['name' => $fieldData['name']],
                $fieldData
            );

            // Create operational hours for each field (Mon-Sun, 08:00-23:00)
            for ($day = 0; $day <= 6; $day++) {
                OperationalHour::updateOrCreate(
                    ['field_id' => $field->id, 'day_of_week' => $day],
                    [
                        'open_time' => '08:00',
                        'close_time' => '23:00',
                        'is_open' => true,
                    ]
                );
            }
        }
    }
}
