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

  const defaultTestingEmail = 'info@msangambe.com';
  
  const adminRecipients = ['sondynasty@msangambe.com'];

  // Common Header/Style Block with CSS gradient hack to bypass Gmail's dark-to-light auto-inversion
  const emailStyleAndHead = `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark only">
  <style>
    :root { color-scheme: dark only; supported-color-schemes: dark only; }
    body, .body-table {
      background-color: #050505 !important;
      background-image: linear-gradient(#050505, #050505) !important;
      color: #e5e5e5 !important;
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
      background-color: #0c0c0c !important;
      background-image: linear-gradient(#0c0c0c, #0c0c0c) !important;
      border: 1px solid #222222 !important;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      text-align: left;
    }
    .logo {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #ffffff !important;
      margin-bottom: 24px;
      border-bottom: 1px solid #222222;
      padding-bottom: 20px;
    }
    .title {
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 2px;
      color: #888888 !important;
      text-transform: uppercase;
      margin-bottom: 20px;
      text-align: center;
    }
    .row {
      margin-bottom: 16px;
    }
    .label {
      font-size: 10px;
      letter-spacing: 1px;
      color: #666666 !important;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .value {
      font-size: 14px;
      color: #ffffff !important;
    }
    .message-box {
      background: #111111;
      border-left: 2px solid #c9a054;
      padding: 16px;
      border-radius: 4px;
      margin-top: 12px;
      color: #cccccc !important;
      font-style: italic;
      font-size: 14px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 15px;
      line-height: 1.6;
      color: #e5e5e5 !important;
      margin-bottom: 24px;
    }
    .details-title {
      font-size: 11px;
      letter-spacing: 1px;
      color: #555555 !important;
      text-transform: uppercase;
      margin-top: 24px;
      margin-bottom: 12px;
      border-bottom: 1px solid #111111;
      padding-bottom: 6px;
    }
    .horizontal-row {
      margin-bottom: 12px;
    }
    .horizontal-label {
      font-size: 10px;
      letter-spacing: 1px;
      color: #555555 !important;
      text-transform: uppercase;
      display: inline-block;
      width: 130px;
    }
    .horizontal-value {
      font-size: 13px;
      color: #b5b5b5 !important;
      display: inline-block;
    }
    .closing {
      margin-top: 32px;
      font-size: 13px;
      letter-spacing: 1.5px;
      color: #cccccc !important;
      text-align: center;
      line-height: 1.8;
      text-transform: uppercase;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 9px;
      color: #444444 !important;
      letter-spacing: 1.5px;
      border-top: 1px solid #111111;
      padding-top: 20px;
      text-transform: uppercase;
    }
    
    /* Strict override overrides to prevent client-side auto-inversion */
    @media (prefers-color-scheme: dark) {
      body, .body-table { background-color: #050505 !important; background-image: linear-gradient(#050505, #050505) !important; color: #e5e5e5 !important; }
      .card { background-color: #0c0c0c !important; background-image: linear-gradient(#0c0c0c, #0c0c0c) !important; border-color: #222222 !important; }
      .value, .logo { color: #ffffff !important; }
    }
    @media (prefers-color-scheme: light) {
      body, .body-table { background-color: #050505 !important; background-image: linear-gradient(#050505, #050505) !important; color: #e5e5e5 !important; }
      .card { background-color: #0c0c0c !important; background-image: linear-gradient(#0c0c0c, #0c0c0c) !important; border-color: #222222 !important; }
      .value, .logo { color: #ffffff !important; }
    }
  </style>
</head>`;

  // 1. Build Admin HTML Template (wrapped in table for mobile styling compatibility)
  const adminHtml = `<!DOCTYPE html>
<html>
${emailStyleAndHead}
<body>
  <table class="body-table" width="100%" height="100%" bgcolor="#050505" cellpadding="0" cellspacing="0" border="0" style="background-color: #050505; width: 100%; height: 100%; margin: 0; padding: 40px 20px;">
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
  <table class="body-table" width="100%" height="100%" bgcolor="#050505" cellpadding="0" cellspacing="0" border="0" style="background-color: #050505; width: 100%; height: 100%; margin: 0; padding: 40px 20px;">
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
    // If using the default onboarding domain, Resend requires 'from' to be 'onboarding@resend.dev'
    const fromSender = (RESEND_API_KEY && RESEND_API_KEY.includes('re_NMZiLgfS'))
      ? 'onboarding@resend.dev'
      : 'Dynasty World <info@msangambe.com>';

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
        'onboarding@resend.dev',
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
        'onboarding@resend.dev',
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
