<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompaniesSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Vicinity Studio Pte. Ltd.',
            'Vicinity Studio Sdn. Bhd.',
            'Catharsis Pte. Ltd.',
        ];
        foreach ($names as $name) {
            Company::updateOrCreate(['name' => $name], ['status' => 'active']);
        }
    }
}

