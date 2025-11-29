<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public string $code) {}

    public function build()
    {
        $settings = \App\Models\Setting::current();
        return $this->subject('Your Vicinity Finance Portal OTP')
            ->view('emails.otp')
            ->with(['code' => $this->code, 'logoUrl' => $settings->logoUrl()]);
    }
}
