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
                'logoUrl' => $setting->logoUrl(),
                'site_title' => $setting->site_title,
                'favicon_url' => $setting->faviconUrl(),
                'faviconUrl' => $setting->faviconUrl(),
                'payment_notification_title' => $setting->payment_notification_title,
                'payment_notification_text' => $setting->payment_notification_text,
                'admin_background_url' => $setting->adminBackgroundUrl(),
                'adminBackgroundUrl' => $setting->adminBackgroundUrl(),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'finance_email' => ['nullable','email'],
            'site_title' => ['nullable','string','max:255'],
            'logo' => ['nullable','image','max:5120'],
            'favicon' => ['nullable','mimes:png,ico,svg,webp,jpg,jpeg','max:2048'],
            'payment_notification_title' => ['nullable','string','max:255'],
            'payment_notification_text' => ['nullable','string'],
            'admin_background' => ['nullable','image','max:10240'],
        ]);
        $setting = Setting::current();

        $email = (string) $request->input('finance_email', '');
        if ($email !== '') {
            $setting->finance_email = $email;
        }

        $title = (string) $request->input('site_title', '');
        if ($title !== '') {
            $setting->site_title = $title;
        }

        $pnTitle = (string) $request->input('payment_notification_title', '');
        if ($pnTitle !== '') {
            $setting->payment_notification_title = $pnTitle;
        }

        $pnText = (string) $request->input('payment_notification_text', '');
        if ($pnText !== '') {
            $setting->payment_notification_text = $pnText;
        }

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $dir = 'logos';
            Storage::disk('public')->makeDirectory($dir);
            $name = 'logo-'.time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs($dir, $name, 'public');
            $setting->logo_path = $path; // stored relative to public disk
        }

        if ($request->hasFile('favicon')) {
            $file = $request->file('favicon');
            $dir = 'favicons';
            Storage::disk('public')->makeDirectory($dir);
            $name = 'favicon-'.time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs($dir, $name, 'public');
            $setting->favicon_path = $path;
        }

        if ($request->hasFile('admin_background')) {
            $file = $request->file('admin_background');
            $dir = 'backgrounds';
            Storage::disk('public')->makeDirectory($dir);
            $name = 'admin-bg-'.time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs($dir, $name, 'public');
            $setting->admin_background_path = $path;
        }

        $setting->save();
        return response()->json([
            'success' => true,
            'settings' => [
                'finance_email' => $setting->finance_email,
                'logo_url' => $setting->logoUrl(),
                'site_title' => $setting->site_title,
                'favicon_url' => $setting->faviconUrl(),
                'payment_notification_title' => $setting->payment_notification_title,
                'payment_notification_text' => $setting->payment_notification_text,
                'admin_background_url' => $setting->adminBackgroundUrl(),
            ],
        ]);
    }
}
