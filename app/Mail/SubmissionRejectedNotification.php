<?php

namespace App\Mail;

use App\Models\SubmissionDraft;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class SubmissionRejectedNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public SubmissionDraft $submission;
    public string $role;

    public function __construct(SubmissionDraft $submission, string $role)
    {
        $this->submission = $submission;
        $this->role = $role; // 'producer' or 'finance'
    }

    public function build()
    {
        $settings = \App\Models\Setting::current();
        return $this->subject('Your Submission Was Rejected')
            ->view('emails.submission_rejected')
            ->with([
                'submission' => $this->submission,
                'role' => $this->role,
                'reason' => $this->role === 'finance' ? ($this->submission->finance_rejection_reason ?? '') : ($this->submission->producer_rejection_reason ?? ''),
                'logoUrl' => $settings->logoUrl(),
            ]);
    }
}
