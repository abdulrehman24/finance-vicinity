<?php

namespace App\Mail;

use App\Models\SubmissionDraft;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class SubmissionAcceptedNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public SubmissionDraft $submission;

    public function __construct(SubmissionDraft $submission)
    {
        $this->submission = $submission;
    }

    public function build()
    {
        $settings = \App\Models\Setting::current();
        return $this->subject('Your Submission Was Approved')
            ->view('emails.submission_accepted')
            ->with([
                'submission' => $this->submission,
                'logoUrl' => $settings->logoUrl(),
            ]);
    }
}

