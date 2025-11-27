<?php

namespace App\Mail;

use App\Models\SubmissionDraft;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SubmissionNotification extends Mailable
{
    use Queueable, SerializesModels;

    public SubmissionDraft $submission;
    public string $acceptUrl;
    public string $rejectUrl;

    public function __construct(SubmissionDraft $submission, string $acceptUrl, string $rejectUrl)
    {
        $this->submission = $submission;
        $this->acceptUrl = $acceptUrl;
        $this->rejectUrl = $rejectUrl;
    }

    public function build()
    {
        return $this->subject('New Submission Pending Your Approval')
            ->view('emails.submission_notification')
            ->with([
                'submission' => $this->submission,
                'acceptUrl' => $this->acceptUrl,
                'rejectUrl' => $this->rejectUrl,
            ]);
    }
}

