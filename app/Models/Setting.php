<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Setting extends Model
{
    protected $fillable = ['finance_email', 'logo_path', 'site_title', 'favicon_path', 'payment_notification_title', 'payment_notification_text', 'admin_background_path'];

    public static function current(): self
    {
        $setting = self::query()->first();
        if (!$setting) {
            $setting = new self([
                'finance_email' => 'finance@vicinity.studio',
                'logo_path' => 'logo.webp',
                'site_title' => 'Vicinity Finance Portal',
                'favicon_path' => null,
                'payment_notification_title' => 'Payment Notification',
                'payment_notification_text' => 'You will be notified of payments via email from our bank when funds are transferred to your account.',
                'admin_background_path' => null,
            ]);
            $setting->save();
        }
        return $setting;
    }

    public function logoUrl(): string
    {
        $path = (string) ($this->logo_path ?? '');
        if ($path === '' || preg_match('/^https?:\/\//i', $path)) {
            return $path !== '' ? $path : asset('logo.webp');
        }
        if (str_starts_with($path, 'storage/')) {
            return url($path);
        }
        if (Storage::disk('public')->exists($path)) {
            return url(Storage::url($path));
        }
        return asset('logo.webp');
    }

    public function faviconUrl(): string
    {
        $path = (string) ($this->favicon_path ?? '');
        if ($path === '' || preg_match('/^https?:\/\//i', $path)) {
            return $path !== '' ? $path : asset('favicon.ico');
        }
        if (str_starts_with($path, 'storage/')) {
            return url($path);
        }
        if (Storage::disk('public')->exists($path)) {
            return url(Storage::url($path));
        }
        return asset('favicon.ico');
    }

    public function adminBackgroundUrl(): string
    {
        $path = (string) ($this->admin_background_path ?? '');
        if ($path === '') return '';
        if (preg_match('/^https?:\/\//i', $path)) return $path;
        if (str_starts_with($path, 'storage/')) return url($path);
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            return url(\Illuminate\Support\Facades\Storage::url($path));
        }
        return '';
    }
}
