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
        $settings = \App\Models\Setting::current();
        $code = (string) ($this->submission->project_code ?? '');
        $invNo = (string) ($this->submission->invoice_number ?? '');
        $amt = number_format((float) ($this->submission->total_amount ?? 0), 2);
        $titleCode = $code !== '' ? $code : $invNo;
        $subject = 'INV - '.($titleCode !== '' ? $titleCode : 'N/A').' - $'.$amt;
        $mail = $this->subject($subject)
            ->view('emails.submission_notification')
            ->with([
                'submission' => $this->submission,
                'acceptUrl' => $this->acceptUrl,
                'rejectUrl' => $this->rejectUrl,
                'logoUrl' => $settings->logoUrl(),
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
