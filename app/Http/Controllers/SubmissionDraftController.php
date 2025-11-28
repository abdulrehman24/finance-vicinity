<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubmissionDraft;
use App\Models\Producer;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;
use App\Mail\SubmissionNotification;
use Yajra\DataTables\Facades\DataTables;
use Spatie\PdfToText\Pdf;
use Smalot\PdfParser\Parser;

class SubmissionDraftController extends Controller
{
    protected function email(Request $request): string
    {
        return (string) $request->session()->get('user_email');
    }

    public function step1(Request $request)
    {
        $request->validate([
            'producerEmail' => 'required|email',
            'billTo' => 'nullable|string',
            'documentType' => 'required|string',
            'receiptType' => 'nullable|string',
            'projectCode' => 'nullable|string',
            'total' => 'required|numeric',
            'amountRows' => 'array'
        ]);
        $email = $this->email($request);
        $draft = SubmissionDraft::firstOrCreate(
            ['user_email' => $email, 'status' => 'draft'],
            [
                'producer_in_charge' => $request->input('producerEmail'),
                'producer_id' => optional(Producer::where('email', $request->input('producerEmail'))->first())->id,
                'bill_to' => $request->input('BillTo', $request->input('billTo')),
                'document_type' => $request->input('documentType'),
                'receipt_type' => $request->input('receiptType'),
                'project_code' => $request->input('projectCode'),
                'total_amount' => $request->input('total'),
                'amount_rows' => $request->input('amountRows'),
                'files' => [],
                'current_step' => 1,
            ]
        );
        // Ensure latest values are saved if the draft already existed
        $draft->fill([
            'producer_in_charge' => $request->input('producerEmail'),
            'producer_id' => optional(Producer::where('email', $request->input('producerEmail'))->first())->id,
            'bill_to' => $request->input('BillTo', $request->input('billTo')),
            'document_type' => $request->input('documentType'),
            'receipt_type' => $request->input('receiptType'),
            'project_code' => $request->input('projectCode'),
            'total_amount' => $request->input('total'),
            'amount_rows' => $request->input('amountRows'),
            'current_step' => 1,
        ])->save();
        return response()->json(['success' => true, 'id' => $draft->id]);
    }

    public function files(Request $request)
    {
        $email = $this->email($request);
        $draft = SubmissionDraft::firstOrCreate(['user_email' => $email, 'status' => 'draft']);

        $stored = [];
        if ($request->hasFile('files')) {
            $request->validate(['files.*' => 'file|mimes:pdf,png,jpg,jpeg,gif,webp|max:10240']);
            $assigned = (array) $request->input('assignedTypes', []);
            foreach ($request->file('files') as $idx => $file) {
                $path = $file->store('submissions/'.$draft->id, 'public');
                $stored[] = [
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                    'assignedType' => $assigned[$idx] ?? null,
                    'path' => $path,
                    'url' => \Illuminate\Support\Facades\Storage::url($path),
                ];
            }
        }

        $metaOnly = (array) $request->input('files', []);
        if ($stored) {
            $existing = is_array($draft->files) ? $draft->files : [];
            $merged = array_values(array_merge($existing, $stored));
            $dedup = [];
            $seen = [];
            foreach ($merged as $ex) {
                $key = (($ex['name'] ?? '')).'|'.(string)($ex['size'] ?? '');
                if (isset($seen[$key])) {
                    $idx = $seen[$key];
                    $prev = $dedup[$idx];
                    $keepCurrent = isset($ex['path']) && $ex['path'];
                    $keepPrev = isset($prev['path']) && $prev['path'];
                    if ($keepCurrent && !$keepPrev) { $dedup[$idx] = $ex; }
                } else {
                    $seen[$key] = count($dedup);
                    $dedup[] = $ex;
                }
            }
            $draft->files = array_values($dedup);
        } elseif ($request->has('files')) {
            $existing = is_array($draft->files) ? $draft->files : [];
            $present = [];
            foreach ($metaOnly as $m) {
                $present[(($m['name'] ?? '')).'|'.(string)($m['size'] ?? '')] = $m;
            }
            $updated = [];
            foreach ($existing as $ex) {
                $key = (($ex['name'] ?? '')).'|'.(string)($ex['size'] ?? '');
                if (isset($present[$key])) {
                    $m = $present[$key];
                    $ex['assignedType'] = $m['assignedType'] ?? ($ex['assignedType'] ?? null);
                    if (isset($m['type'])) { $ex['type'] = $m['type']; }
                    if (isset($m['size'])) { $ex['size'] = $m['size']; }
                    $updated[] = $ex;
                } else {
                    $p = $ex['path'] ?? null;
                    if ($p) { \Illuminate\Support\Facades\Storage::disk('public')->delete($p); }
                }
            }
            $draft->files = array_values($updated);
        }
        $draft->files = array_values(array_filter(is_array($draft->files) ? $draft->files : [], function($f){ return isset($f['path']) && $f['path']; }));
        $draft->current_step = 2;
        $draft->save();
        return response()->json(['success' => true, 'id' => $draft->id, 'files' => $draft->files]);
    }

    public function ocr(Request $request)
    {
        $email = $this->email($request);
        $draft = SubmissionDraft::firstOrCreate(['user_email' => $email, 'status' => 'draft']);
        $files = is_array($draft->files) ? $draft->files : [];
        $expected = (float) ($draft->total_amount ?? 0);
        $expectedAmounts = [];
        $rows = is_array($draft->amount_rows) ? $draft->amount_rows : [];
        foreach ($rows as $r) {
            $amt = isset($r['amount']) ? (float) str_replace(',', '', $r['amount']) : null;
            if ($amt && $amt > 0) { $expectedAmounts[] = $amt; }
        }
        $results = [];
        $allCandidates = [];
        foreach ($files as $idx => $file) {
            $path = $file['path'] ?? null;
            if (!$path) { continue; }
            $full = Storage::disk('public')->path($path);
            if (!is_file($full)) { continue; }
            $type = (string) ($file['type'] ?? '');
            $isPdf = stripos($type, 'pdf') !== false || preg_match('/\.pdf$/i', $full);
            if (!$isPdf) { continue; }
            $text = '';
            try { $text = Pdf::getText($full); } catch (\Throwable $e) {
                try { $parser = new Parser(); $pdf = $parser->parseFile($full); $text = (string) $pdf->getText(); } catch (\Throwable $e2) { $text = ''; }
            }
            $candidates = $this->extractAmountsFromText($text);
            $matched = false; $matchValue = null;
            if ($expectedAmounts) {
                foreach ($candidates as $val) { foreach ($expectedAmounts as $ea) { if (abs($val - $ea) < 0.01) { $matched = true; $matchValue = $val; break 2; } } }
            } else {
                foreach ($candidates as $val) { if (abs($val - $expected) < 0.01) { $matched = true; $matchValue = $val; break; } }
            }
            $results[] = [
                'index' => $idx,
                'name' => $file['name'] ?? basename($full),
                'assignedType' => $file['assignedType'] ?? null,
                'foundAmounts' => array_values($candidates),
                'matched' => $matched,
                'matchValue' => $matchValue,
            ];
            foreach ($candidates as $val) { $allCandidates[] = $val; }
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
        $draft->current_step = 3;
        $draft->save();
        return response()->json([
            'success' => true,
            'id' => $draft->id,
            'expected' => $expected,
            'expectedAmounts' => $expectedAmounts,
            'matchedAmounts' => $matchedAmounts,
            'results' => $results,
            'verified' => $verified,
        ]);
    }

    private function extractAmountsFromText(string $text): array
    {
        $lines = preg_split('/\r\n|\n|\r/', $text);
        $labelNumbers = [];
        $allNumbers = [];
        foreach ($lines as $line) {
            $lower = strtolower($line);
            $hasLabel = (strpos($lower, 'total') !== false) || (strpos($lower, 'amount due') !== false) || (strpos($lower, 'balance due') !== false) || (strpos($lower, 'grand total') !== false) || (strpos($lower, 'invoice total') !== false) || (strpos($lower, 'amount payable') !== false);
            preg_match_all('/(?:s\$|sgd|myr|usd)?\s*\$?\s*(-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})|-?\d+(?:\.\d{1,2})?)/i', $line, $m);
            if (!empty($m[1])) {
                foreach ($m[1] as $raw) {
                    $val = (float) str_replace(',', '', $raw);
                    if ($hasLabel) { $labelNumbers[] = $val; }
                    $allNumbers[] = $val;
                }
            }
        }
        $labelNumbers = array_values(array_unique($labelNumbers));
        $allNumbers = array_values(array_unique($allNumbers));
        return array_values(array_unique(array_merge($labelNumbers, $allNumbers)));
    }

    public function submit(Request $request)
    {
        $request->validate([
            'total' => 'required|numeric'
        ]);
        $email = $this->email($request);
        $draft = SubmissionDraft::where('user_email', $email)->where('status', 'draft')->first();
        if (!$draft) {
            $draft = new SubmissionDraft([
                'user_email' => $email,
            ]);
        }
        $draft->total_amount = $request->input('total');
        $draft->current_step = 4;
        $check = $this->verifyAmountsAgainstUploaded($draft);
        if (!$check['verified']) {
            return response()->json(['success' => false, 'message' => 'Entered total does not match amounts in uploaded PDFs', 'results' => $check['results']], 422);
        }
        $draft->status = 'pending';
        if (!$draft->invoice_number) {
            $draft->invoice_number = $this->generateInvoiceNumber();
        }
        $draft->save();

        if ($draft->producer_in_charge) {
            $acceptUrl = URL::temporarySignedRoute('drafts.producer.accept', now()->addDays(7), ['submission' => $draft->id]);
            $rejectUrl = URL::temporarySignedRoute('drafts.producer.reject', now()->addDays(7), ['submission' => $draft->id]);
            Mail::to($draft->producer_in_charge)->send(new SubmissionNotification($draft, $acceptUrl, $rejectUrl));
        }
        return response()->json(['success' => true, 'id' => $draft->id]);
    }

    private function generateInvoiceNumber(): string
    {
        $prefix = 'VF';
        do {
            $seg1 = str_pad((string) random_int(0, 999), 3, '0', STR_PAD_LEFT);
            $seg2 = str_pad((string) random_int(0, 999), 3, '0', STR_PAD_LEFT);
            $seg3 = str_pad((string) random_int(0, 99), 2, '0', STR_PAD_LEFT);
            $code = $prefix.'-'.$seg1.'-'.$seg2.'-'.$seg3;
        } while (\App\Models\SubmissionDraft::where('invoice_number', $code)->exists());
        return $code;
    }

    private function verifyAmountsAgainstUploaded(SubmissionDraft $draft): array
    {
        $files = is_array($draft->files) ? $draft->files : [];
        $expected = (float) ($draft->total_amount ?? 0);
        $expectedAmounts = [];
        $rows = is_array($draft->amount_rows) ? $draft->amount_rows : [];
        foreach ($rows as $r) {
            $amt = isset($r['amount']) ? (float) str_replace(',', '', $r['amount']) : null;
            if ($amt && $amt > 0) { $expectedAmounts[] = $amt; }
        }
        $results = [];
        $allCandidates = [];
        foreach ($files as $idx => $file) {
            $path = $file['path'] ?? null;
            if (!$path) { continue; }
            $full = \Illuminate\Support\Facades\Storage::disk('public')->path($path);
            if (!is_file($full)) { continue; }
            $type = (string) ($file['type'] ?? '');
            $isPdf = stripos($type, 'pdf') !== false || preg_match('/\.pdf$/i', $full);
            if (!$isPdf) { continue; }
            $text = '';
            try { $text = \Spatie\PdfToText\Pdf::getText($full); } catch (\Throwable $e) {
                try { $parser = new \Smalot\PdfParser\Parser(); $pdf = $parser->parseFile($full); $text = (string) $pdf->getText(); } catch (\Throwable $e2) { $text = ''; }
            }
            $candidates = $this->extractAmountsFromText($text);
            $matched = false; $matchValue = null;
            if ($expectedAmounts) {
                foreach ($candidates as $val) { foreach ($expectedAmounts as $ea) { if (abs($val - $ea) < 0.01) { $matched = true; $matchValue = $val; break 2; } } }
            } else {
                foreach ($candidates as $val) { if (abs($val - $expected) < 0.01) { $matched = true; $matchValue = $val; break; } }
            }
            $results[] = [
                'index' => $idx,
                'name' => $file['name'] ?? basename($full),
                'assignedType' => $file['assignedType'] ?? null,
                'foundAmounts' => array_values($candidates),
                'matched' => $matched,
                'matchValue' => $matchValue,
            ];
            foreach ($candidates as $val) { $allCandidates[] = $val; }
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
        return ['verified' => $verified, 'results' => $results, 'expected' => $expected, 'expectedAmounts' => $expectedAmounts, 'matchedAmounts' => $matchedAmounts];
    }

    public function accept(Request $request, SubmissionDraft $submission)
    {
        if ($submission->status !== 'pending') {
            return response('Invalid submission state', 422);
        }
        $submission->accepted_by_producer = 'accepted';
        $submission->save();

        $financeAcceptUrl = URL::temporarySignedRoute('drafts.finance.accept', now()->addDays(7), ['submission' => $submission->id]);
        $financeRejectUrl = URL::temporarySignedRoute('drafts.finance.reject', now()->addDays(7), ['submission' => $submission->id]);
        Mail::to('finance@vicinity.studio')->send(new SubmissionNotification($submission, $financeAcceptUrl, $financeRejectUrl));
        return response('Submission accepted successfully');
    }

    public function reject(Request $request, SubmissionDraft $submission)
    {
        if ($submission->status !== 'pending') {
            return response('Invalid submission state', 422);
        }
        $actionUrl = URL::temporarySignedRoute('drafts.producer.reject.submit', now()->addDays(1), ['submission' => $submission->id]);
        $html = "<!doctype html><html><head><meta charset='utf-8'><title>Reject Submission</title><meta name='viewport' content='width=device-width, initial-scale=1'><style>body{font-family:Arial, sans-serif;background:#0f172a;color:#e5e7eb;padding:24px} .card{background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:12px;max-width:640px;margin:0 auto;padding:16px} label{display:block;margin-bottom:8px;color:#e5e7eb;font-weight:bold} textarea{width:100%;min-height:140px;background:#0b1220;color:#e5e7eb;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:12px} button{margin-top:12px;background:#ef4444;color:#0f172a;font-weight:bold;padding:10px 16px;border-radius:8px;border:none;cursor:pointer} .muted{color:#9ca3af;font-size:12px;margin-top:8px}</style></head><body><div class='card'><h2 style='margin:0 0 12px'>Reject Submission</h2><p class='muted'>Please provide a reason for rejection. This will be sent to the submitter.</p><form method='post' action='".
            htmlspecialchars($actionUrl, ENT_QUOTES, 'UTF-8').
            "'>".
            csrf_field().
            "<label for='reason'>Reason</label><textarea id='reason' name='reason' placeholder='Explain the reason for rejection…' required></textarea><button type='submit'>Submit Rejection</button></form></div></body></html>";
        return response($html);
    }

    public function rejectSubmit(Request $request, SubmissionDraft $submission)
    {
        if ($submission->status !== 'pending') {
            return response('Invalid submission state', 422);
        }
        $request->validate(['reason' => 'required|string|max:2000']);
        $submission->accepted_by_producer = 'rejected';
        $submission->status = 'rejected';
        $submission->producer_rejection_reason = $request->input('reason');
        $submission->save();
        try {
            Mail::to($submission->user_email)->send(new \App\Mail\SubmissionRejectedNotification($submission, 'producer'));
        } catch (\Throwable $e) {}
        return response('Submission rejected with reason successfully');
    }

    public function financeAccept(Request $request, SubmissionDraft $submission)
    {
        if ($submission->status !== 'pending') {
            return response('Invalid submission state', 422);
        }
        $submission->accepted_by_finance = 'accepted';
        $submission->status = 'accepted';
        $submission->save();
        return response('Finance accepted successfully');
    }

    public function financeReject(Request $request, SubmissionDraft $submission)
    {
        if ($submission->status !== 'pending') {
            return response('Invalid submission state', 422);
        }
        $actionUrl = URL::temporarySignedRoute('drafts.finance.reject.submit', now()->addDays(1), ['submission' => $submission->id]);
        $html = "<!doctype html><html><head><meta charset='utf-8'><title>Reject Submission</title><meta name='viewport' content='width=device-width, initial-scale=1'><style>body{font-family:Arial, sans-serif;background:#0f172a;color:#e5e7eb;padding:24px} .card{background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:12px;max-width:640px;margin:0 auto;padding:16px} label{display:block;margin-bottom:8px;color:#e5e7eb;font-weight:bold} textarea{width:100%;min-height:140px;background:#0b1220;color:#e5e7eb;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:12px} button{margin-top:12px;background:#ef4444;color:#0f172a;font-weight:bold;padding:10px 16px;border-radius:8px;border:none;cursor:pointer} .muted{color:#9ca3af;font-size:12px;margin-top:8px}</style></head><body><div class='card'><h2 style='margin:0 0 12px'>Reject Submission</h2><p class='muted'>Please provide a reason for rejection. This will be sent to the submitter.</p><form method='post' action='".
            htmlspecialchars($actionUrl, ENT_QUOTES, 'UTF-8').
            "'>".
            csrf_field().
            "<label for='reason'>Reason</label><textarea id='reason' name='reason' placeholder='Explain the reason for rejection…' required></textarea><button type='submit'>Submit Rejection</button></form></div></body></html>";
        return response($html);
    }

    public function financeRejectSubmit(Request $request, SubmissionDraft $submission)
    {
        if ($submission->status !== 'pending') {
            return response('Invalid submission state', 422);
        }
        $request->validate(['reason' => 'required|string|max:2000']);
        $submission->accepted_by_finance = 'rejected';
        $submission->status = 'rejected';
        $submission->finance_rejection_reason = $request->input('reason');
        $submission->save();
        try {
            Mail::to($submission->user_email)->send(new \App\Mail\SubmissionRejectedNotification($submission, 'finance'));
        } catch (\Throwable $e) {}
        return response('Finance rejected with reason successfully');
    }

    public function me(Request $request)
    {
        $email = $this->email($request);
        $draft = SubmissionDraft::where('user_email', $email)->where('status', 'draft')->first();
        if ($draft && is_array($draft->files)) {
            $merged = $draft->files;
            $dedup = [];
            $seen = [];
            foreach ($merged as $ex) {
                $key = (($ex['name'] ?? '')).'|'.(string)($ex['size'] ?? '');
                if (isset($seen[$key])) {
                    $idx = $seen[$key];
                    $prev = $dedup[$idx];
                    $keepCurrent = isset($ex['path']) && $ex['path'];
                    $keepPrev = isset($prev['path']) && $prev['path'];
                    if ($keepCurrent && !$keepPrev) { $dedup[$idx] = $ex; }
                } else {
                    $seen[$key] = count($dedup);
                    $dedup[] = $ex;
                }
            }
            $draft->files = array_values(array_filter($dedup, function($f){ return isset($f['path']) && $f['path']; }));
        }
        return response()->json(['success' => true, 'draft' => $draft]);
    }

    public function list(Request $request)
    {
        $email = $this->email($request);
        $items = SubmissionDraft::where('user_email', $email)
            ->where('status', '!=', 'draft')
            ->orderByDesc('updated_at')
            ->get();
        return response()->json(['success' => true, 'items' => $items]);
    }

    public function adminData(Request $request)
    {
        $query = SubmissionDraft::query()->where('status', '!=', 'draft');
        $val = (string) ($request->input('search.value') ?? '');
        if ($val !== '') {
            $query->where(function($q) use ($val){
                $q->where('user_email', 'like', "%$val%")
                  ->orWhere('document_type', 'like', "%$val%")
                  ->orWhere('status', 'like', "%$val%")
                  ->orWhere('invoice_number', 'like', "%$val%")
                  ->orWhere('id', 'like', "%$val%");
            });
        }
        return DataTables::eloquent($query)
            ->editColumn('total_amount', function($row){
                return number_format((float)($row->total_amount ?? 0), 2);
            })
            ->editColumn('created_at', function($row){
                return $row->created_at ? $row->created_at->format('d M Y, h:i A') : '';
            })
            ->toJson();
    }

    public function download(Request $request, SubmissionDraft $submission, int $index)
    {
        $files = is_array($submission->files) ? $submission->files : [];
        if (!isset($files[$index])) {
            return response('Not found', 404);
        }
        $file = $files[$index];
        $path = $file['path'] ?? null;
        if (!$path || !Storage::disk('public')->exists($path)) {
            return response('Not found', 404);
        }
        $full = Storage::disk('public')->path($path);
        $name = $file['name'] ?? basename($full);
        $type = $file['type'] ?? null;
        $headers = $type ? ['Content-Type' => $type] : [];
        return response()->download($full, $name, $headers);
    }
}
