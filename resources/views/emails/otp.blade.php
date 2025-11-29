<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vicinity OTP</title>
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
                      <img src="{{ $logoUrl ?? asset('logo.webp') }}" style="height:24px; width:auto; display:block;" alt="Logo" />
                    </td>
                    <td>
                      <div style="color:#0f172a;">
                        <div style="font-size:18px; font-weight:bold;">Vicinity</div>
                        <div class="hero-subtitle" style="font-size:12px; opacity:0.8;">One-Time Code</div>
                      </div>
                    </td>
                  </tr>
                </table>
                <h1 class="hero-title" style="margin:12px 0 0; font-size:22px; line-height:1.3; color:#0f172a;">Your Verification Code</h1>
                <p class="hero-subtitle" style="margin:8px 0 0; color:#0f172a; opacity:0.8;">Use this code to sign in.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px; color:#e5e7eb;">
                <h2 style="margin:0 0 8px; font-size:20px; color:#ffffff;">Verification Code</h2>
                <p style="margin:0 0 16px; color:#9ca3af;">Use this code to complete your login. It expires in 10 minutes.</p>
                <div style="margin:12px 0; display:inline-block; background:#0b1220; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:14px 18px;">
                  <div style="font-size:28px; font-weight:bold; letter-spacing:6px; color:#f3bec7;">{{ $code }}</div>
                </div>
                <p style="margin-top:16px; color:#6b7280; font-size:12px;">If you did not request this, you can ignore this email.</p>
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
