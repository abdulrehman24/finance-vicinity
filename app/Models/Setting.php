<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Setting extends Model
{
    protected $fillable = ['finance_email', 'logo_path'];

    public static function current(): self
    {
        $setting = self::query()->first();
        if (!$setting) {
            $setting = new self([
                'finance_email' => 'finance@vicinity.studio',
                'logo_path' => 'logo.webp',
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
}

