<?php

namespace App\Mail;

use App\Models\SubmissionDraft;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class SubmissionNotification extends Mailable implements ShouldQueue
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
        $mail = $this->subject('New Submission Pending Your Approval')
            ->view('emails.submission_notification')
            ->with([
                'submission' => $this->submission,
                'acceptUrl' => $this->acceptUrl,
                'rejectUrl' => $this->rejectUrl,
            ]);
        $path = (string) ($this->submission->combined_invoice_pdf ?? '');
        if ($path && Storage::disk('public')->exists($path)) {
            $mail->attach(Storage::disk('public')->path($path), [
                'as' => 'combined-invoices.pdf',
                'mime' => 'application/pdf'
            ]);
        }
        return $mail;
    }
}
