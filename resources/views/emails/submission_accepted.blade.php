<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Submission Approved</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .p-24 { padding: 16px !important; }
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
              <td class="p-24" style="background:#4a5a67; padding:24px;">
                <table role="presentation" width="100%">
                  <tr>
                    <td style="width:48px;">
                      <img src="{{ $logoUrl ?? asset('logo.webp') }}" style="height:24px; width:auto; display:block;" alt="Logo" />
                    </td>
                    <td>
                      <div style="color:#ebc1b6;">
                        <div style="font-size:18px; font-weight:bold;">Vicinity</div>
                        <div style="font-size:12px; opacity:0.8;">Submission Approved</div>
                      </div>
                    </td>
                  </tr>
                </table>
                <h1 style="margin:12px 0 0; font-size:22px; line-height:1.3; color:#ebc1b6;">Your Submission Has Been Approved</h1>
                <p style="margin:8px 0 0; color:#ebc1b6; opacity:0.8;">Reviewed by Finance.</p>
                <div style="margin-top:12px; background:#0b1220; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:12px;">
                  <p style="margin:0; font-size:13px; color:#e5e7eb;"><strong style="color:#ebc1b6;">Payment Notification</strong> — You will be notified of payments via email from our bank when funds are transferred to your account. Payments will be made within 30-60 days.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="p-24" style="padding:24px; color:#e5e7eb;">
                <div class="card" style="background:#0b1220; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
                  <p style="margin:0 0 8px; font-weight:bold; color:#ffffff;">Submission Details</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Invoice Number</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ $submission->invoice_number }}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Invoice Created Date</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ optional($submission->created_at)->format('d M Y, h:i A') }}</td>
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
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Project Title</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ $submission->project_title }}</td>
                    </tr>
                    @endif
                    <tr>
                      <td style="padding:6px 0; color:#9ca3af;">Total Amount</td>
                      <td style="padding:6px 0; color:#ffffff;" align="right">{{ number_format((float)($submission->total_amount ?? 0), 2) }}</td>
                    </tr>
                  </table>
                </div>
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

