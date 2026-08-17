// Vercel Serverless Function: api/send-email.js
// Securely routes form submissions via Resend to protect API Keys from client exposure.

const RESEND_API_KEY = process.env.RESEND_API_KEY;

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
  const defaultTestingEmail = 'mthunzi.sibiya2005@gmail.com';
  
  // Admin emails to notify
  const adminRecipients = ['sondynastyent@gmail.com', 'mnksigudla@gmail.com'];

  // 1. Build Admin HTML Template
  const adminHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background-color: #050505; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #0c0c0c; border: 1px solid #222222; border-radius: 12px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
    .logo { text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 4px; color: #ffffff; margin-bottom: 24px; border-bottom: 1px solid #222222; padding-bottom: 20px; }
    .title { font-size: 16px; font-weight: 500; letter-spacing: 2px; color: #888888; text-transform: uppercase; margin-bottom: 20px; }
    .row { margin-bottom: 16px; }
    .label { font-size: 11px; letter-spacing: 1px; color: #666666; text-transform: uppercase; margin-bottom: 4px; }
    .value { font-size: 14px; color: #ffffff; }
    .message-box { background: #111111; border-left: 2px solid #c9a054; padding: 16px; border-radius: 4px; margin-top: 12px; color: #cccccc; font-style: italic; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; margin-top: 32px; font-size: 10px; color: #444444; letter-spacing: 1.5px; border-top: 1px solid #111111; padding-top: 20px; text-transform: uppercase; }
  </style>
</head>
<body>
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
</body>
</html>`;

  // 2. Build User Confirmation HTML Template
  const userHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background-color: #050505; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #0c0c0c; border: 1px solid #222222; border-radius: 12px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
    .logo { text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 4px; color: #ffffff; margin-bottom: 24px; border-bottom: 1px solid #222222; padding-bottom: 20px; }
    .title { font-size: 16px; font-weight: 500; letter-spacing: 2px; color: #cccccc; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
    .greeting { font-size: 15px; line-height: 1.6; color: #e5e5e5; margin-bottom: 24px; }
    .details-title { font-size: 11px; letter-spacing: 1px; color: #555555; text-transform: uppercase; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #111111; padding-bottom: 6px; }
    .row { margin-bottom: 12px; }
    .label { font-size: 10px; letter-spacing: 1px; color: #555555; text-transform: uppercase; display: inline-block; width: 120px; }
    .value { font-size: 13px; color: #b5b5b5; display: inline-block; }
    .message-box { background: #111111; border-left: 2px solid #333333; padding: 12px; border-radius: 4px; color: #999999; font-style: italic; font-size: 13px; margin-top: 8px; }
    .closing { margin-top: 32px; font-size: 14px; color: #ffffff; text-align: center; line-height: 1.8; }
    .footer { text-align: center; margin-top: 32px; font-size: 9px; color: #444444; letter-spacing: 1.5px; border-top: 1px solid #111111; padding-top: 20px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">SON DYNASTY</div>
    <div class="title">Transmission Secured</div>
    
    <div class="greeting">
      Greetings ${name},<br><br>
      Your signal has been received and secured in the Dynasty. Msangambe "Son Dynasty" Sigudla has been notified of your transmission and will connect with you shortly.
    </div>

    <div class="details-title">Transmission Reference Details</div>
    
    <div class="row">
      <span class="label">Reference Name:</span>
      <span class="value">${name} ${surname}</span>
    </div>
    <div class="row">
      <span class="label">Contact Number:</span>
      <span class="value">${number}</span>
    </div>
    <div class="row">
      <span class="label">Email Address:</span>
      <span class="value">${email}</span>
    </div>
    ${message ? `
    <div class="row">
      <span class="label">Your Message:</span>
      <div class="message-box">${message}</div>
    </div>` : ''}
    
    <div class="closing">
      Walk in the light.<br>
      <strong>SON DYNASTY</strong>
    </div>

    <div class="footer">This is an automated receipt confirmation from msangambe.com</div>
  </div>
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
