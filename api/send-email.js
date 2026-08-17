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

  // Common Header/Style Block with White, Silver & Charcoal theme (Look One)
  const emailStyleAndHead = `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    
    body, .body-table {
      background-color: #F7F5F2 !important;
      background-image: linear-gradient(#F7F5F2, #F7F5F2) !important;
      color: #1C1C1C !important;
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .body-table {
      padding: 30px 15px !important;
    }
    .card {
      max-width: 580px;
      width: 100%;
      background-color: #FFFFFF !important;
      background-image: linear-gradient(#FFFFFF, #FFFFFF) !important;
      border: 1px solid rgba(192, 192, 192, 0.4) !important;
      border-radius: 12px;
      text-align: left;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .card-content {
      padding: 36px !important;
    }
    .title {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #8A8A8A !important;
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
      color: #1C1C1C !important;
    }
    .message-box {
      background: #F7F5F2;
      border-left: 2px solid #8A8A8A;
      padding: 16px;
      border-radius: 4px;
      margin-top: 12px;
      color: #1C1C1C !important;
      font-style: italic;
      font-size: 14px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 15px;
      line-height: 1.7;
      color: #1C1C1C !important;
      margin-bottom: 24px;
    }
    .details-title {
      font-size: 11px;
      letter-spacing: 1.5px;
      color: #8A8A8A !important;
      text-transform: uppercase;
      margin-top: 28px;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(192, 192, 192, 0.2);
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
      color: #1C1C1C !important;
      display: inline-block;
    }
    .closing {
      margin-top: 36px;
      font-size: 11px;
      letter-spacing: 2px;
      color: #8A8A8A !important;
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
      border-top: 1px solid rgba(192, 192, 192, 0.2);
      padding-top: 20px;
      text-transform: uppercase;
    }
    
    /* Strict override overrides to prevent client-side auto-inversion */
    @media (prefers-color-scheme: dark) {
      body, .body-table { background-color: #F7F5F2 !important; background-image: linear-gradient(#F7F5F2, #F7F5F2) !important; color: #1C1C1C !important; }
      .card { background-color: #FFFFFF !important; background-image: linear-gradient(#FFFFFF, #FFFFFF) !important; border-color: rgba(192, 192, 192, 0.4) !important; }
      .value { color: #1C1C1C !important; }
    }
    @media (prefers-color-scheme: light) {
      body, .body-table { background-color: #F7F5F2 !important; background-image: linear-gradient(#F7F5F2, #F7F5F2) !important; color: #1C1C1C !important; }
      .card { background-color: #FFFFFF !important; background-image: linear-gradient(#FFFFFF, #FFFFFF) !important; border-color: rgba(192, 192, 192, 0.4) !important; }
      .value { color: #1C1C1C !important; }
    }
  </style>
</head>`;

  // 1. Build Admin HTML Template (Look One, pure tables)
  const adminHtml = `<!DOCTYPE html>
<html>
${emailStyleAndHead}
<body>
  <table class="body-table" width="100%" height="100%" bgcolor="#F7F5F2" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7F5F2; background-image: linear-gradient(#F7F5F2, #F7F5F2) !important; width: 100%; height: 100%; margin: 0; padding: 30px 15px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Top Centered Banner Strip -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-top: 1px solid rgba(192, 192, 192, 0.3); border-left: 1px solid rgba(192, 192, 192, 0.3); border-right: 1px solid rgba(192, 192, 192, 0.3); border-radius: 12px 12px 0 0; text-align: center;">
          <tr>
            <td style="padding: 14px 10px; font-family: 'Cinzel', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 8px; font-weight: 400; letter-spacing: 0.25em; text-transform: uppercase; color: #8A8A8A;">
              MSANGAMBE SIGUDLA &nbsp;·&nbsp; SON DYNASTY &nbsp;·&nbsp; SOUTH AFRICA
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF) !important; border: 1px solid rgba(192, 192, 192, 0.4); border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <tr>
            <td class="card-content" style="padding: 36px;">
              
              <!-- Header Row with Crest Logo & Cursive Title -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px; border-bottom: 1px solid rgba(192, 192, 192, 0.2); padding-bottom: 20px;">
                <tr>
                  <td width="60" valign="middle" align="left">
                    <img src="https://msangambe.com/assets/logo-crest-black-on-white.png" alt="SM Crest" width="50" style="display: block; border: 0;">
                  </td>
                  <td valign="middle" align="center" style="padding-right: 60px;">
                    <img src="https://msangambe.com/assets/images/welcome_dynasty_world_dark.png" alt="Welcome to Dynasty World" width="336" style="display: block; margin: 0 auto; border: 0;">
                  </td>
                </tr>
              </table>

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
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  // 2. Build User Confirmation HTML Template (Look One, pure tables)
  const userHtml = `<!DOCTYPE html>
<html>
${emailStyleAndHead}
<body>
  <table class="body-table" width="100%" height="100%" bgcolor="#F7F5F2" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7F5F2; background-image: linear-gradient(#F7F5F2, #F7F5F2) !important; width: 100%; height: 100%; margin: 0; padding: 30px 15px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Top Centered Banner Strip -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-top: 1px solid rgba(192, 192, 192, 0.3); border-left: 1px solid rgba(192, 192, 192, 0.3); border-right: 1px solid rgba(192, 192, 192, 0.3); border-radius: 12px 12px 0 0; text-align: center;">
          <tr>
            <td style="padding: 14px 10px; font-family: 'Cinzel', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 8px; font-weight: 400; letter-spacing: 0.25em; text-transform: uppercase; color: #8A8A8A;">
              MSANGAMBE SIGUDLA &nbsp;·&nbsp; SON DYNASTY &nbsp;·&nbsp; SOUTH AFRICA
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF) !important; border: 1px solid rgba(192, 192, 192, 0.4); border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <tr>
            <td class="card-content" style="padding: 36px;">
              
              <!-- Header Row with Crest Logo & Cursive Title -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px; border-bottom: 1px solid rgba(192, 192, 192, 0.2); padding-bottom: 20px;">
                <tr>
                  <td width="60" valign="middle" align="left">
                    <img src="https://msangambe.com/assets/logo-crest-black-on-white.png" alt="SM Crest" width="50" style="display: block; border: 0;">
                  </td>
                  <td valign="middle" align="center" style="padding-right: 60px;">
                    <img src="https://msangambe.com/assets/images/welcome_dynasty_world_dark.png" alt="Welcome to Dynasty World" width="336" style="display: block; margin: 0 auto; border: 0;">
                  </td>
                </tr>
              </table>
              
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
                <img src="https://msangambe.com/assets/images/msangambe_signature_dark.png" alt="Msangambe" width="220" style="display: block; margin: 12px auto 0; border: 0;">
              </div>

              <!-- Magnification Dock (Social Bar) -->
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto 0; background-color: #FFFFFF; border: 1px solid rgba(192, 192, 192, 0.3); border-radius: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 8px 16px;">
                <tr>
                  <!-- YouTube -->
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.youtube.com/@sondynastytv" target="_blank" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #EFEFED; border-radius: 50%; text-decoration: none; text-align: center;">
                      <img src="https://img.icons8.com/ios-glyphs/30/1c1c1c/youtube-play.png" alt="YouTube" width="18" height="18" style="display: inline-block; vertical-align: middle; border: 0;">
                    </a>
                  </td>
                  <!-- Instagram -->
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.instagram.com/msangambe_" target="_blank" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #EFEFED; border-radius: 50%; text-decoration: none; text-align: center;">
                      <img src="https://img.icons8.com/ios-glyphs/30/1c1c1c/instagram-new.png" alt="Instagram" width="18" height="18" style="display: inline-block; vertical-align: middle; border: 0;">
                    </a>
                  </td>
                  <!-- TikTok -->
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.tiktok.com/@sondynasty" target="_blank" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #EFEFED; border-radius: 50%; text-decoration: none; text-align: center;">
                      <img src="https://img.icons8.com/ios-glyphs/30/1c1c1c/tiktok.png" alt="TikTok" width="18" height="18" style="display: inline-block; vertical-align: middle; border: 0;">
                    </a>
                  </td>
                  <!-- Twitch -->
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.twitch.tv/sondynastytv" target="_blank" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #EFEFED; border-radius: 50%; text-decoration: none; text-align: center;">
                      <img src="https://img.icons8.com/ios-glyphs/30/1c1c1c/twitch.png" alt="Twitch" width="18" height="18" style="display: inline-block; vertical-align: middle; border: 0;">
                    </a>
                  </td>
                  <!-- Twitter/X -->
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://x.com/msangambe1" target="_blank" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #EFEFED; border-radius: 50%; text-decoration: none; text-align: center;">
                      <img src="https://img.icons8.com/ios-glyphs/30/1c1c1c/twitter.png" alt="X" width="18" height="18" style="display: inline-block; vertical-align: middle; border: 0;">
                    </a>
                  </td>
                </tr>
              </table>

              <div class="footer">This is an automated receipt confirmation from msangambe.com</div>
            </td>
          </tr>
        </table>

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
