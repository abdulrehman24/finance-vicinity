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
        $expectedBillTo = (string) ($draft->bill_to ?? '');
        $rows = is_array($draft->amount_rows) ? $draft->amount_rows : [];
        $amounts = [];
        foreach ($rows as $r) {
            $v = (float) ($r['amount'] ?? 0);
            if ($v > 0) { $amounts[] = $v; }
        }
        if (empty($amounts)) {
            $t = (float) ($draft->total_amount ?? 0);
            if ($t > 0) { $amounts[] = $t; }
        }
        $pdfs = [];
        foreach ($files as $idx => $f) {
            $type = (string) ($f['type'] ?? '');
            $path = (string) ($f['path'] ?? '');
            $name = (string) ($f['name'] ?? '');
            $ocrEnabled = array_key_exists('ocr', (array)$f) ? (bool) ($f['ocr']) : true;
            $isPdf = stripos($type, 'pdf') !== false || preg_match('/\.pdf$/i', $path) || preg_match('/\.pdf$/i', $name);
            if ($ocrEnabled && $isPdf && $path) { $pdfs[] = $f; }
        }
        if (count($pdfs) === 0 || count($amounts) === 0) {
            return ['verified' => false, 'amountFound' => false, 'billToMatched' => false];
        }
        $unique = [];
        foreach ($amounts as $a) { $unique[(string)$a] = false; }
        $billToAny = false;
        $details = [];
        foreach ($pdfs as $f) {
            $fullPath = Storage::disk('public')->path((string)$f['path']);
            $res = $this->analyzePdfForAmounts($fullPath, array_values(array_map('floatval', array_keys($unique))), $expectedBillTo);
            $matches = is_array($res['matches'] ?? null) ? $res['matches'] : [];
            $matchedAmounts = [];
            $missingAmounts = [];
            foreach ($matches as $m) {
                $amt = (string) (isset($m['amount']) ? (float) $m['amount'] : 0);
                $found = (bool) ($m['found'] ?? false) || (bool) ($m['finalTotal'] ?? false);
                if (array_key_exists($amt, $unique) && $found) { $unique[$amt] = true; }
                if ($found) { $matchedAmounts[] = (float)$amt; } else { $missingAmounts[] = (float)$amt; }
            }
            $billToAny = $billToAny || (bool) ($res['billToMatched'] ?? false);
            $details[] = [
                'name' => (string)($f['name'] ?? ''),
                'assignedType' => (string)($f['assignedType'] ?? ''),
                'url' => (string)($f['url'] ?? ''),
                'matches' => $matches,
                'matchedAmounts' => $matchedAmounts,
                'missingAmounts' => $missingAmounts,
            ];
        }
        $allFound = true;
        foreach ($unique as $ok) { if (!$ok) { $allFound = false; break; } }
        return ['verified' => $allFound, 'amountFound' => $allFound, 'billToMatched' => $billToAny, 'details' => $details];
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

    private function analyzePdfForAmounts(string $pdfPath, array $amounts, string $expectedBillTo): array
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($pdfPath);
        $text = $pdf->getText();
        $list = json_encode(array_values(array_map('floatval', $amounts)));
        $prompt = "\nYou are analyzing a financial document.\nExpected Bill To: {$expectedBillTo}.\n\nText of the document:\n\"\"\"{$text}\"\"\"\n\nGiven this JSON array of amounts: {$list}\nFor each amount, indicate if it appears anywhere in the document and whether it appears as the FINAL TOTAL.\nRespond ONLY in strict JSON:\n{\n  \"matches\": [{\"amount\": number, \"found\": true|false, \"finalTotal\": true|false}],\n  \"billToMatched\": true|false\n}\n";
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
        if (is_array($parsed)) { return $parsed; }
        return ['matches' => [], 'billToMatched' => false];
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
