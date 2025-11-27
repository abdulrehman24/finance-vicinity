<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Submission Notification</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .p-24 { padding: 16px !important; }
        .p-16 { padding: 12px !important; }
        .btn { display: block !important; width: 100% !important; margin: 8px 0 !important; text-align: center !important; }
        .hero-title { font-size: 20px !important; }
        .hero-subtitle { font-size: 13px !important; }
        .card { padding: 12px !important; }
        .table th, .table td { padding: 8px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#0f172a; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" class="container" style="max-width:600px; margin:24px; background:#111827; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
            <tr>
              <td class="p-24" style="background:linear-gradient(135deg,#ffffff 0%,#f3bec7 100%); padding:24px;">
                <table role="presentation" width="100%">
                  <tr>
                    <td style="width:48px;">
                      <img src="{{ asset('logo.webp') }}" style="height:24px; width:auto; display:block;" alt="Logo" />
                    </td>
                    <td>
                      <div style="color:#0f172a;">
                        <div style="font-size:18px; font-weight:bold;">Vicinity</div>
                        <div class="hero-subtitle" style="font-size:12px; opacity:0.8;">Approval Request</div>
                      </div>
                    </td>
                  </tr>
                </table>
                <h1 class="hero-title" style="margin:12px 0 0; font-size:22px; line-height:1.3; color:#0f172a;">New Submission Awaits Your Review</h1>
                <p class="hero-subtitle" style="margin:8px 0 0; color:#0f172a; opacity:0.8;">Please review and approve or reject this submission.</p>
              </td>
            </tr>
            <tr>
              <td class="p-24" style="padding:24px; color:#e5e7eb;">
                <div class="card" style="background:#0b1220; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
                  <p style="margin:0 0 8px; font-weight:bold; color:#ffffff;">Submission Details</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Producer in Charge</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ $submission->producer_in_charge }}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Document Type</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ $submission->document_type }}</td>
                    </tr>
                    @if(($submission->document_type ?? '') === 'receipt')
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Receipt Type</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ $submission->receipt_type }}</td>
                    </tr>
                    @endif
                    @if(($submission->document_type ?? '') !== 'receipt')
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Project Code</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ $submission->project_code }}</td>
                    </tr>
                    @endif
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Total Amount</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ number_format((float)($submission->total_amount ?? 0), 2) }}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Submitted By</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ $submission->user_email }}</td>
                    </tr>
                  </table>
                </div>

                @if(is_array($submission->amount_rows) && count($submission->amount_rows))
                <div class="card" style="margin-top:16px; background:#0b1220; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
                  <p style="margin:0 0 8px; font-weight:bold; color:#ffffff;">Amount Details</p>
                  @php $sum = 0; @endphp
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="table" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:8px 0; color:#e5e7eb; font-weight:bold; border-bottom:1px solid rgba(255,255,255,0.12);">Item</td>
                      <td style="padding:8px 0; color:#e5e7eb; font-weight:bold; border-bottom:1px solid rgba(255,255,255,0.12);" align="right">Amount</td>
                    </tr>
                    @foreach($submission->amount_rows as $row)
                      @if(!empty($row['description']) && !empty($row['amount']))
                        @php $sum += (float)$row['amount']; @endphp
                        <tr>
                          <td style="padding:6px 0; color:#9ca3af;">{{ $row['description'] }}</td>
                          <td style="padding:6px 0; color:#ffffff;" align="right">${{ number_format((float)$row['amount'], 2) }}</td>
                        </tr>
                      @endif
                    @endforeach
                    <tr>
                      <td style="padding:8px 0; color:#e5e7eb; font-weight:bold; border-top:1px solid rgba(255,255,255,0.12);">Total</td>
                      <td style="padding:8px 0; color:#e5e7eb; font-weight:bold; border-top:1px solid rgba(255,255,255,0.12);" align="right">${{ number_format((float)($sum), 2) }}</td>
                    </tr>
                  </table>
                </div>
                @endif

                @if(is_array($submission->files) && count($submission->files))
                <div class="card" style="margin-top:16px; background:#0b1220; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
                  <p style="margin:0 0 8px; font-weight:bold; color:#ffffff;">Attached Documents</p>
                  <ul style="margin:0; padding-left:18px; color:#9ca3af;">
                    @foreach($submission->files as $idx => $f)
                      <li>
                        <span style="color:#e5e7eb;">{{ $f['name'] ?? 'Document' }}</span>
                        @if(!empty($f['assignedType']))
                          <span style="color:#9ca3af;"> — {{ $f['assignedType'] }}</span>
                        @endif
                        @if(!empty($f['url']))
                          <a href="{{ $f['url'] }}" style="color:#a7f3d0; text-decoration:none; margin-left:8px;" target="_blank">View</a>
                          <a href="{{ \Illuminate\Support\Facades\URL::temporarySignedRoute('drafts.file.download', now()->addDays(7), ['submission' => $submission->id, 'index' => $idx]) }}" style="color:#a7f3d0; text-decoration:none; margin-left:8px; display:inline-block; background:#0b1220; border:1px solid rgba(255,255,255,0.12); padding:2px 8px; border-radius:6px;">
                            <span style="font-weight:bold; color:#a7f3d0;">⬇︎</span>
                            <span style="margin-left:4px; color:#a7f3d0;">Download</span>
                          </a>
                        @endif
                      </li>
                    @endforeach
                  </ul>
                </div>
                @endif

                <div style="text-align:center; margin-top:24px;">
                  <a href="{{ $acceptUrl }}" class="btn" style="display:inline-block; background:#10b981; color:#0f172a; font-weight:bold; padding:12px 20px; border-radius:8px; text-decoration:none; margin-right:12px;">Accept Submission</a>
                  <a href="{{ $rejectUrl }}" class="btn" style="display:inline-block; background:#ef4444; color:#0f172a; font-weight:bold; padding:12px 20px; border-radius:8px; text-decoration:none;">Reject Submission</a>
                </div>
                <p style="color:#9ca3af; font-size:12px; text-align:center; margin-top:12px;">These links expire in 7 days.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px; text-align:center; color:#6b7280; font-size:12px;">Vicinity Finance Portal</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
