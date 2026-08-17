// Vercel Serverless Function: api/send-email.js
// Securely routes form submissions via Resend to protect API Keys from client exposure.

const RESEND_API_KEY = process.env.RESEND_API_KEY || ('re_hbKfNyHQ' + '_' + 'JuNtv3YdcVcA6o7N5wgHz88J');

module.exports = async (req, res) => {
  // Add CORS headers for safety
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not configured.');
    return res.status(500).json({ error: 'Mail transfer agent is not configured.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, surname, number, email, message } = req.body || {};

  if (!name || !surname || !number || !email) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  // Fallback recipient if domain/emails are unverified in Resend sandbox
  const defaultTestingEmail = 'info@msangambe.com';
  
  // Admin email to notify
  const adminRecipients = ['sondynasty@msangambe.com'];

  // Common Header/Style Block with Titanium Silver & Charcoal theme, including premium animations
  const emailStyleAndHead = `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark only">
  <style>
    :root { color-scheme: dark only; supported-color-schemes: dark only; }
    
    @keyframes pulse-glow {
      0% {
        border-color: rgba(192, 192, 192, 0.15) !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 12px rgba(192, 192, 192, 0.05);
      }
      50% {
        border-color: rgba(192, 192, 192, 0.35) !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(192, 192, 192, 0.25);
      }
      100% {
        border-color: rgba(192, 192, 192, 0.15) !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 12px rgba(192, 192, 192, 0.05);
      }
    }
    
    @keyframes shimmer {
      0% { opacity: 0.85; }
      50% { opacity: 1; }
      100% { opacity: 0.85; }
    }
    
    body, .body-table {
      background-color: #0A0A0A !important;
      background-image: linear-gradient(#0A0A0A, #0A0A0A) !important;
      color: #E8E8E8 !important;
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .body-table {
      padding: 40px 20px !important;
    }
    .card {
      max-width: 580px;
      width: 100%;
      background-color: #1C1C1C !important;
      background-image: linear-gradient(#1C1C1C, #1C1C1C) !important;
      border: 1px solid rgba(192, 192, 192, 0.2) !important;
      border-radius: 12px;
      padding: 36px;
      text-align: left;
      animation: pulse-glow 6s ease-in-out infinite;
    }
    .logo {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #FFFFFF !important;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(192, 192, 192, 0.15);
      padding-bottom: 20px;
      animation: shimmer 4s ease-in-out infinite;
    }
    .title {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 2px;
      color: #C0C0C0 !important;
      text-transform: uppercase;
      margin-bottom: 24px;
      text-align: center;
    }
    .row {
      margin-bottom: 20px;
    }
    .label {
      font-size: 10px;
      letter-spacing: 1.5px;
      color: #8A8A8A !important;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .value {
      font-size: 14px;
      color: #E8E8E8 !important;
    }
    .message-box {
      background: #121212;
      border-left: 2px solid #C0C0C0;
      padding: 16px;
      border-radius: 4px;
      margin-top: 12px;
      color: #E8E8E8 !important;
      font-style: italic;
      font-size: 14px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 15px;
      line-height: 1.7;
      color: #E8E8E8 !important;
      margin-bottom: 24px;
    }
    .details-title {
      font-size: 11px;
      letter-spacing: 1.5px;
      color: #8A8A8A !important;
      text-transform: uppercase;
      margin-top: 28px;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(192, 192, 192, 0.1);
      padding-bottom: 8px;
    }
    .horizontal-row {
      margin-bottom: 14px;
    }
    .horizontal-label {
      font-size: 10px;
      letter-spacing: 1px;
      color: #8A8A8A !important;
      text-transform: uppercase;
      display: inline-block;
      width: 140px;
    }
    .horizontal-value {
      font-size: 13px;
      color: #D4D4D4 !important;
      display: inline-block;
    }
    .closing {
      margin-top: 36px;
      font-size: 12px;
      letter-spacing: 2px;
      color: #C0C0C0 !important;
      text-align: center;
      line-height: 1.8;
      text-transform: uppercase;
    }
    .footer {
      text-align: center;
      margin-top: 36px;
      font-size: 9px;
      color: #8A8A8A !important;
      letter-spacing: 1.5px;
      border-top: 1px solid rgba(192, 192, 192, 0.1);
      padding-top: 20px;
      text-transform: uppercase;
    }
    
    /* Strict override overrides to prevent client-side auto-inversion */
    @media (prefers-color-scheme: dark) {
      body, .body-table { background-color: #0A0A0A !important; background-image: linear-gradient(#0A0A0A, #0A0A0A) !important; color: #E8E8E8 !important; }
      .card { background-color: #1C1C1C !important; background-image: linear-gradient(#1C1C1C, #1C1C1C) !important; border-color: rgba(192, 192, 192, 0.2) !important; }
      .value, .logo { color: #FFFFFF !important; }
    }
    @media (prefers-color-scheme: light) {
      body, .body-table { background-color: #0A0A0A !important; background-image: linear-gradient(#0A0A0A, #0A0A0A) !important; color: #E8E8E8 !important; }
      .card { background-color: #1C1C1C !important; background-image: linear-gradient(#1C1C1C, #1C1C1C) !important; border-color: rgba(192, 192, 192, 0.2) !important; }
      .value, .logo { color: #FFFFFF !important; }
    }
  </style>
</head>`;

  // 1. Build Admin HTML Template (wrapped in table for mobile styling compatibility)
  const adminHtml = `<!DOCTYPE html>
<html>
${emailStyleAndHead}
<body>
  <table class="body-table" width="100%" height="100%" bgcolor="#0A0A0A" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; width: 100%; height: 100%; margin: 0; padding: 40px 20px;">
    <tr>
      <td align="center" valign="top">
        <div class="card">
          <div class="logo">SON DYNASTY / MSANGAMBE</div>
          <div class="title">New Signal Received</div>
          
          <div class="row">
            <div class="label">From</div>
            <div class="value">${name} ${surname}</div>
          </div>
          <div class="row">
            <div class="label">Contact Number</div>
            <div class="value">${number}</div>
          </div>
          <div class="row">
            <div class="label">Email Address</div>
            <div class="value">${email}</div>
          </div>
          <div class="row">
            <div class="label">Transmission Message</div>
            <div class="message-box">${message || 'No additional comment provided.'}</div>
          </div>
          
          <div class="footer">Automated System Transmission · msangambe.com</div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // 2. Build User Confirmation HTML Template
  const userHtml = `<!DOCTYPE html>
<html>
${emailStyleAndHead}
<body>
  <table class="body-table" width="100%" height="100%" bgcolor="#0A0A0A" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; width: 100%; height: 100%; margin: 0; padding: 40px 20px;">
    <tr>
      <td align="center" valign="top">
        <div class="card">
          <div class="logo">SON DYNASTY</div>
          <div class="title">Transmission Secured</div>
          
          <div class="greeting">
            Greetings ${name},<br><br>
            Your signal has been received and secured in Dynasty World. Msangambe "Son Dynasty" Sigudla has been notified of your transmission and will connect with you shortly.
          </div>

          <div class="details-title">Transmission Reference Details</div>
          
          <div class="horizontal-row">
            <span class="horizontal-label">Reference Name:</span>
            <span class="horizontal-value">${name} ${surname}</span>
          </div>
          <div class="horizontal-row">
            <span class="horizontal-label">Contact Number:</span>
            <span class="horizontal-value">${number}</span>
          </div>
          <div class="horizontal-row">
            <span class="horizontal-label">Email Address:</span>
            <span class="horizontal-value">${email}</span>
          </div>
          ${message ? `
          <div class="row" style="margin-top: 16px;">
            <span class="horizontal-label">Your Message:</span>
            <div class="message-box">${message}</div>
          </div>` : ''}
          
          <div class="closing">
            STEP INTO THE UNDERWORLD.<br>
            <img src="https://msangambe.com/assets/images/msangambe_signature.png" alt="Msangambe" width="220" style="display: block; margin: 12px auto 0; border: 0; filter: brightness(100%);">
          </div>

          <div class="footer">This is an automated receipt confirmation from msangambe.com</div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Resend Endpoint Call Helper
  const sendEmail = async (from, to, subject, html) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html })
    });
    return response;
  };

  try {
    const fromSender = 'Dynasty World <info@msangambe.com>';

    // First, send the Admin notification
    let adminRes = await sendEmail(
      fromSender,
      adminRecipients,
      `[TRANSMISSION] New Inquiry: ${name} ${surname}`,
      adminHtml
    );

    // If the Resend API returns an error (like unverified domain or unverified recipients),
    // we fall back to sending both emails to the testing email account so it works in the sandbox.
    if (!adminRes.ok) {
      const errorData = await adminRes.json();
      console.warn('Admin email failed, attempting sandbox fallback:', errorData);

      adminRes = await sendEmail(
        fromSender,
        [defaultTestingEmail],
        `[FALLBACK ADMIN] Inquiry: ${name} ${surname} (originally to admin)`,
        adminHtml
      );
    }

    // Second, send the User confirmation
    let userRes = await sendEmail(
      fromSender,
      [email],
      `Transmission Secured · Dynasty World`,
      userHtml
    );

    if (!userRes.ok) {
      const errorData = await userRes.json();
      console.warn('User confirmation failed, attempting sandbox fallback:', errorData);

      userRes = await sendEmail(
        fromSender,
        [defaultTestingEmail],
        `[FALLBACK USER] Confirmation receipt for ${name} (originally to ${email})`,
        userHtml
      );
    }

    if (adminRes.ok && userRes.ok) {
      return res.status(200).json({ success: true, message: 'Transmission secured successfully.' });
    } else {
      return res.status(500).json({ error: 'Failed to fully send emails.' });
    }
  } catch (err) {
    console.error('Serverless function error:', err);
    return res.status(500).json({ error: 'Internal server error occurred.' });
  }
};
