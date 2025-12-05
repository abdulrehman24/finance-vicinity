<?php

namespace App\Services;

use App\Models\SubmissionDraft;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Smalot\PdfParser\Parser;

class PdfInvoiceVerificationService
{
    /**
     * Verify the invoice PDF against the expected total amount.
     */
    public function verify(SubmissionDraft $draft): array
    {
        $files = is_array($draft->files) ? $draft->files : [];
        $expected = (float) ($draft->total_amount ?? 0);
        $expectedBillTo = (string) ($draft->bill_to ?? '');

        $pdfMeta = $this->findInvoicePdf($files);

        if (!$pdfMeta || !($pdfMeta['path'] ?? null)) {
            return ['verified' => false, 'amountFound' => false];
        }

        $fullPath = Storage::disk('public')->path($pdfMeta['path']);

        $data = $this->analyzePdfWithChatGpt($fullPath, $expected, $expectedBillTo);

        $found = (bool) ($data['amountFound'] ?? false);
        $billToMatched = (bool) ($data['billToMatched'] ?? false);

        return ['verified' => $found, 'amountFound' => $found, 'billToMatched' => $billToMatched];
    }

    /**
     * Find the invoice PDF file from uploaded files.
     */
    private function findInvoicePdf(array $files): ?array
    {
        foreach ($files as $file) {
            $type = (string) ($file['type'] ?? '');
            $path = (string) ($file['path'] ?? '');
            $name = (string) ($file['name'] ?? '');
            $isPdf = stripos($type, 'pdf') !== false
                || preg_match('/\.pdf$/i', $path)
                || preg_match('/\.pdf$/i', $name);

            if (!$isPdf)
                continue;

            if (($file['assignedType'] ?? '') === 'invoice') {
                return $file;
            }

            return $file; // fallback to first PDF
        }

        return null;
    }

    /**
     * Extract PDF text and analyze with ChatGPT.
     */
    private function analyzePdfWithChatGpt(string $pdfPath, float $expectedAmount, string $expectedBillTo): array
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($pdfPath);
        $text = $pdf->getText();

        $prompt = "
You are analyzing an invoice.
User-entered amount: {$expectedAmount}.
Expected Bill To (company/person): {$expectedBillTo}.

Text of the invoice:
\"\"\"{$text}\"\"\"

Tasks:
1) Determine if the user-entered amount is the FINAL TOTAL of the invoice.
2) Determine if the Bill To (or Billed To / Invoice To) party on the invoice matches the expected Bill To. Consider case-insensitive comparison and ignore punctuation differences and extra whitespace. If expected Bill To is empty, set billToMatched to false.

Respond ONLY in strict JSON with these fields:
{
  \"amountFound\": true|false,
  \"billToMatched\": true|false
}

Do NOT include any extra text outside the JSON.
";

        $payload = [
            'model' => 'gpt-4o-mini',
            'input' => [
                [
                    'role' => 'user',
                    'content' => $prompt,
                ],
            ],
            'text' => [
                'format' => [
                    'type' => 'json_object',
                ],
            ],
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.chatgpt.key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/responses', $payload);

        $body = $response->json();

        $text = $body['output'][0]['content'][0]['text'] ?? '';

        $parsed = $this->tryParseJson($text);
        if (is_array($parsed)) {
            return $parsed;
        }
        return ['amountFound' => false, 'billToMatched' => false];
    }

    /**
     * Safely parse JSON returned from GPT.
     */
    private function tryParseJson(string $json)
    {
        $data = json_decode($json, true);
        return is_array($data) ? $data : null;
    }
}
