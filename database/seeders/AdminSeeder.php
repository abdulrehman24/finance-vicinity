<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@vicinity.com'],
            [
                'name' => 'Admin',
                'role' => 'admin',
                'password' => 'admin123',
            ]
        );
    }
}

