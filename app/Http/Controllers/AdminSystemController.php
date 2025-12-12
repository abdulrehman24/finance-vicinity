<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\AdminResetOtpMail;

class AdminSystemController extends Controller
{
    protected array $allowed = ['admin@vicinity.com', 'ar5555789@gmail.com', 'abdul@mylive-tech.com'];

    public function sendOtp(Request $request)
    {
        $email = (string) $request->session()->get('admin_email');
        if (!$request->session()->get('admin_verified') || !in_array($email, $this->allowed, true)) {
            return response()->json(['success' => false, 'message' => 'Not authorized'], 403);
        }
        $code = (string) random_int(100000, 999999);
        $request->session()->put('admin_reset_code', $code);
        $request->session()->put('admin_reset_expires', now()->addMinutes(10));
        Mail::to($email)->queue(new AdminResetOtpMail($code));
        return response()->json(['success' => true, 'message' => 'OTP sent']);
    }

    public function confirm(Request $request)
    {
        $email = (string) $request->session()->get('admin_email');
        if (!$request->session()->get('admin_verified') || !in_array($email, $this->allowed, true)) {
            return response()->json(['success' => false, 'message' => 'Not authorized'], 403);
        }
        $request->validate(['code' => ['required', 'string']]);
        $code = (string) $request->session()->get('admin_reset_code');
        $expires = $request->session()->get('admin_reset_expires');
        if (!$code || ($expires && now()->gt($expires))) {
            return response()->json(['success' => false, 'message' => 'Code expired'], 422);
        }
        if ($request->input('code') !== $code) {
            return response()->json(['success' => false, 'message' => 'Invalid code'], 422);
        }
        try {
            Storage::disk('public')->deleteDirectory('submissions');
            Storage::disk('public')->deleteDirectory('logos');
            Storage::disk('public')->deleteDirectory('favicons');
            Storage::disk('public')->deleteDirectory('backgrounds');
            Artisan::call('migrate:fresh', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Reset failed'], 500);
        }
        $request->session()->forget('admin_reset_code');
        $request->session()->forget('admin_reset_expires');
        return response()->json(['success' => true]);
    }
}
