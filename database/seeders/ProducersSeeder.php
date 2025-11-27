<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producer;

class ProducersSeeder extends Seeder
{
    public function run(): void
    {
        $emails = [
            'aris@vicinity.studio',
            'callista@vicinity.studio',
            'cherlyn@vicinity.studio',
            'chloe@vicinity.studio',
            'dos@vicinity.studio',
            'isaac@vicinity.studio',
            'janani@vicinity.studio',
            'tejushka@vicinity.studio',
        ];
        foreach ($emails as $email) {
            Producer::updateOrCreate(['email' => $email], ['status' => 'active']);
        }
    }
}

