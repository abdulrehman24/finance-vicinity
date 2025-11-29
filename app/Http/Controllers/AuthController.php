<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use App\Models\User;

class AuthController extends Controller
{
    public function sendCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $code = (string) random_int(100000, 999999);
        $request->session()->put('verification_code', $code);
        $request->session()->put('verification_expires', now()->addMinutes(10));
        $request->session()->put('verification_email', $request->input('email'));
        Mail::to($request->input('email'))->queue(new OtpMail($code));
        return response()->json(['success' => true, 'message' => 'OTP sent to your email']);
    }

    public function verify(Request $request)
    {
        $request->validate(['email' => 'required|email', 'code' => 'required']);
        $code = $request->session()->get('verification_code');
        $expires = $request->session()->get('verification_expires');
        if (!$code || ($expires && now()->gt($expires))) {
            return response()->json(['success' => false, 'message' => 'Code expired, please request a new one'], 422);
        }
        if ($request->input('code') === $code) {
            $request->session()->forget('verification_code');
            $request->session()->forget('verification_expires');
            $request->session()->put('verified', true);
            $request->session()->put('user_email', $request->input('email'));
            $user = User::firstOrCreate(['email' => $request->input('email')], [
                'name' => explode('@', $request->input('email'))[0],
                'role' => 'user',
                'password' => ''
            ]);
            $request->session()->put('role', $user->role);
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false, 'message' => 'Invalid verification code'], 422);
    }

    public function logout(Request $request)
    {
        $request->session()->forget('verified');
        $request->session()->forget('user_email');
        $request->session()->forget('verification_code');
        $request->session()->forget('verification_expires');
        return response()->json(['success' => true]);
    }

    public function adminSendCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $code = (string) random_int(100000, 999999);
        $request->session()->put('admin_verification_code', $code);
        $request->session()->put('admin_verification_expires', now()->addMinutes(10));
        $request->session()->put('admin_verification_email', $request->input('email'));
        Mail::to($request->input('email'))->queue(new OtpMail($code));
        return response()->json(['success' => true, 'message' => 'OTP sent to your email']);
    }

    public function adminVerify(Request $request)
    {
        $request->validate(['email' => 'required|email', 'code' => 'required']);
        $code = $request->session()->get('admin_verification_code');
        $expires = $request->session()->get('admin_verification_expires');
        if (!$code || ($expires && now()->gt($expires))) {
            return response()->json(['success' => false, 'message' => 'Code expired, please request a new one'], 422);
        }
        if ($request->input('code') === $code) {
            $request->session()->forget('admin_verification_code');
            $request->session()->forget('admin_verification_expires');
            $request->session()->put('admin_verified', true);
            $request->session()->put('admin_email', $request->input('email'));
            $user = User::firstOrCreate(['email' => $request->input('email')], [
                'name' => explode('@', $request->input('email'))[0],
                'role' => 'admin',
                'password' => ''
            ]);
            $request->session()->put('role', $user->role);
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false, 'message' => 'Invalid verification code'], 422);
    }

    public function adminLogout(Request $request)
    {
        $request->session()->forget('admin_verified');
        $request->session()->forget('admin_email');
        $request->session()->forget('admin_verification_code');
        $request->session()->forget('admin_verification_expires');
        return response()->json(['success' => true]);
    }
}
