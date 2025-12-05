<?php

namespace App\Services;

use App\Models\SubmissionDraft;
use Illuminate\Support\Facades\Storage;

class PdfInvoiceVerificationService
{
    public function verify(SubmissionDraft $draft): array
    {
        $files = is_array($draft->files) ? $draft->files : [];
        $expected = (float) ($draft->total_amount ?? 0);
        $expectedAmounts = [];
        $rows = is_array($draft->amount_rows) ? $draft->amount_rows : [];
        $billTo = (string) ($draft->bill_to ?? '');
        foreach ($rows as $r) {
            $amt = isset($r['amount']) ? (float) str_replace(',', '', $r['amount']) : null;
            if ($amt && $amt > 0) { $expectedAmounts[] = $amt; }
        }
        $results = [];
        $allCandidates = [];
        $invoicePdfCount = 0;
        $billToMatches = 0;
        foreach ($files as $idx => $file) {
            $path = $file['path'] ?? null;
            if (!$path) { continue; }
            $full = Storage::disk('public')->path($path);
            if (!is_file($full)) { continue; }
            $type = (string) ($file['type'] ?? '');
            $isPdf = stripos($type, 'pdf') !== false || preg_match('/\.pdf$/i', $full);
            if (!$isPdf) { continue; }
            $invoicePdfCount++;
            $analysis = $this->analyzeWithChatGpt($full, $billTo, $expected, $expectedAmounts);
            $found = array_values(array_unique(array_map(function($v){ return (float) $v; }, (array) ($analysis['foundAmounts'] ?? []))));
            $matched = false; $matchValue = null;
            if ($expectedAmounts) {
                foreach ($found as $val) { foreach ($expectedAmounts as $ea) { if (abs($val - $ea) < 0.01) { $matched = true; $matchValue = $val; break 2; } } }
            } else {
                foreach ($found as $val) { if (abs($val - $expected) < 0.01) { $matched = true; $matchValue = $val; break; } }
            }
            $billToMatched = (bool) ($analysis['billToMatched'] ?? false);
            if ($billToMatched) { $billToMatches++; }
            $results[] = [
                'index' => $idx,
                'name' => $file['name'] ?? basename($full),
                'assignedType' => $file['assignedType'] ?? null,
                'foundAmounts' => $found,
                'matched' => $matched,
                'matchValue' => $matchValue,
                'billToMatched' => $billToMatched,
            ];
            foreach ($found as $val) { $allCandidates[] = $val; }
        }
        $matchedAmounts = [];
        if ($expectedAmounts) {
            foreach ($expectedAmounts as $ea) {
                $found = false;
                foreach ($allCandidates as $val) { if (abs($val - $ea) < 0.01) { $found = true; break; } }
                if ($found) { $matchedAmounts[] = $ea; }
            }
            $verified = count($matchedAmounts) === count($expectedAmounts) && count($expectedAmounts) > 0;
        } else {
            $verified = $expected > 0 && collect($allCandidates)->contains(function($val) use ($expected){ return abs($val - $expected) < 0.01; });
        }
        $billToVerified = true;
        if ($billTo !== '' && $invoicePdfCount > 0) { $billToVerified = ($billToMatches >= 1); }
        return [
            'verified' => $verified && $billToVerified,
            'results' => $results,
            'expected' => $expected,
            'expectedAmounts' => $expectedAmounts,
            'matchedAmounts' => $matchedAmounts,
            'billToVerified' => $billToVerified,
            'billTo' => $billTo,
        ];
    }

    private function analyzeWithChatGpt(string $pdfPath, string $billTo, float $expected, array $expectedAmounts): array
    {
        $images = $this->pdfToPngDataUris($pdfPath, 2);
        $text = $this->extractTextFallback($pdfPath);
        $key = config('services.chatgpt.key');
        $model = config('services.chatgpt.model', 'gpt-4o-mini');
        $endpoint = config('services.chatgpt.endpoint', 'https://api.openai.com/v1/chat/completions');
        $userText = 'Analyze the provided invoice images and extracted text. Bill To: '.($billTo ?: '').'. Extract ONLY the monetary amounts that are visibly present in the content (do not infer or invent). Focus on totals or payable amounts if clearly labeled. Determine if the Bill To name appears. Return strict JSON: {"foundAmounts": number[], "billToMatched": boolean}. If unsure, return foundAmounts as [] and billToMatched as false.';
        $content = [];
        $content[] = ['type' => 'text', 'text' => $userText];
        foreach ($images as $dataUri) { $content[] = ['type' => 'image_url', 'image_url' => ['url' => $dataUri]]; }
        if ($text !== '') { $content[] = ['type' => 'text', 'text' => 'Extracted text: '.$text]; }
        $payload = [
            'model' => $model,
            'temperature' => 0,
            'messages' => [
                ['role' => 'system', 'content' => 'You are an invoice OCR and verification assistant. Only reply with JSON as requested.'],
                ['role' => 'user', 'content' => $content],
            ],
            'response_format' => ['type' => 'json_object'],
        ];
        $resp = $this->postJson($endpoint, $payload, $key);
        $body = is_array($resp) ? $resp : [];
        $msg = $body['choices'][0]['message']['content'] ?? '';
        $data = $this->tryParseJson($msg);
        logger()->info('ChatGPT response', ['msg' => $msg, 'data' => $data]);
        if (!is_array($data)) { $data = []; }
        return $data;
    }

    private function pdfToPngDataUris(string $path, int $maxPages = 2): array
    {
        $out = [];
        if (class_exists('\\Imagick')) {
            try {
                $imagickClass = '\\Imagick';
                $doc = new $imagickClass();
                $doc->setResolution(200, 200);
                $doc->readImage($path);
                $count = 0;
                foreach ($doc as $page) {
                    if ($count >= $maxPages) { break; }
                    $clone = clone $page;
                    $clone->setImageFormat('png');
                    $data = $clone->getImageBlob();
                    $out[] = 'data:image/png;base64,'.base64_encode($data);
                    $count++;
                }
            } catch (\Throwable $e) {}
        }
        return $out;
    }

    private function extractTextFallback(string $path): string
    {
        $text = '';
        try { $text = \Spatie\PdfToText\Pdf::getText($path); } catch (\Throwable $e) {
            try { $parser = new \Smalot\PdfParser\Parser(); $pdf = $parser->parseFile($path); $text = (string) $pdf->getText(); } catch (\Throwable $e2) { $text = ''; }
        }
        return (string) $text;
    }

    private function tryParseJson(string $s)
    {
        $s = trim((string)$s);
        if ($s === '') { return null; }
        $start = strpos($s, '{');
        $end = strrpos($s, '}');
        if ($start !== false && $end !== false && $end >= $start) {
            $json = substr($s, $start, $end - $start + 1);
            $decoded = json_decode($json, true);
            if (is_array($decoded)) { return $decoded; }
        }
        $decoded = json_decode($s, true);
        if (is_array($decoded)) { return $decoded; }
        return null;
    }

    private function postJson(string $url, array $payload, string $apiKey)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer '.$apiKey,
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 200 && $code < 300 && is_string($resp)) {
            $data = json_decode($resp, true);
            if (is_array($data)) { return $data; }
        }
        return [];
    }
}
