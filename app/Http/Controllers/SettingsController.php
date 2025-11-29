<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function show()
    {
        $setting = Setting::current();
        return Inertia::render('AdminSettings', [
            'settings' => [
                'finance_email' => $setting->finance_email,
                'logo_url' => $setting->logoUrl(),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'finance_email' => ['nullable','email'],
            'logo' => ['nullable','image','max:5120'],
        ]);
        $setting = Setting::current();

        $email = (string) $request->input('finance_email', '');
        if ($email !== '') {
            $setting->finance_email = $email;
        }

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $dir = 'logos';
            Storage::disk('public')->makeDirectory($dir);
            $name = 'logo-'.time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs($dir, $name, 'public');
            $setting->logo_path = $path; // stored relative to public disk
        }

        $setting->save();
        return response()->json([
            'success' => true,
            'settings' => [
                'finance_email' => $setting->finance_email,
                'logo_url' => $setting->logoUrl(),
            ],
        ]);
    }
}

