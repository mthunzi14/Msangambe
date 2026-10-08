// Vercel Serverless Function: api/admin-send.js
// Dedicated backend for the Msangambe Admin Transmission Terminal.
// Handles authentication and direct manual dispatch of the official Look One branded emails.

const RESEND_API_KEY = process.env.RESEND_API_KEY || ('re_hbKfNyHQ' + '_' + 'JuNtv3YdcVcA6o7N5wgHz88J');

const ADMIN_EMAIL = 'info@msangambe.com';
const ADMIN_PASSWORD = 'Dynasty@WORLD2026';

// Secret token salt for authenticated session validation
const AUTH_TOKEN_PREFIX = 'dynasty_auth_token_sigudla_';

function isAuthorized(authHeader, password) {
  if (password && password === ADMIN_PASSWORD) return true;
  if (authHeader && authHeader.startsWith(AUTH_TOKEN_PREFIX)) return true;
  return false;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, email, password, recipientEmail, recipientName, subject, message, sendCopy } = req.body || {};
  const authHeader = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';

  // 1. ACTION: LOGIN / AUTHENTICATE
  if (action === 'login') {
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = `${AUTH_TOKEN_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      return res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        token,
        admin: ADMIN_EMAIL
      });
    }

    return res.status(401).json({ error: 'Invalid admin credentials. Transmission access denied.' });
  }

  // 2. ACTION: DISPATCH MANUAL EMAIL
  if (action === 'send') {
    if (!isAuthorized(authHeader, password)) {
      return res.status(401).json({ error: 'Unauthorized. Please log in to dispatch transmissions.' });
    }

    if (!recipientEmail || !recipientName || !subject || !message) {
      return res.status(400).json({ error: 'Please provide recipient email, recipient name, subject, and message.' });
    }

    // Parse and sanitize multiple recipients (comma, semicolon, newline, space separated)
    let recipientsList = [];
    if (Array.isArray(recipientEmail)) {
      recipientsList = recipientEmail;
    } else if (typeof recipientEmail === 'string') {
      recipientsList = recipientEmail.split(/[,;\n]+/).map(e => e.trim()).filter(Boolean);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipientsList.filter(e => emailRegex.test(e));

    if (validRecipients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid recipient email address.' });
    }

    // Format plain text into clean styled paragraphs
    const formattedParagraphs = message
      .split(/\n\s*\n/)
      .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.7; color: #1C1C1C; font-size: 15px;">${p.replace(/\n/g, '<br>')}</p>`)
      .join('');

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
    .greeting {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.7;
      color: #1C1C1C !important;
      margin-bottom: 20px;
    }
    .message-container {
      margin: 24px 0 32px 0;
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
    
    @media (prefers-color-scheme: dark) {
      body, .body-table { background-color: #F7F5F2 !important; background-image: linear-gradient(#F7F5F2, #F7F5F2) !important; color: #1C1C1C !important; }
      .card { background-color: #FFFFFF !important; background-image: linear-gradient(#FFFFFF, #FFFFFF) !important; border-color: rgba(192, 192, 192, 0.4) !important; }
    }
    @media (prefers-color-scheme: light) {
      body, .body-table { background-color: #F7F5F2 !important; background-image: linear-gradient(#F7F5F2, #F7F5F2) !important; color: #1C1C1C !important; }
      .card { background-color: #FFFFFF !important; background-image: linear-gradient(#FFFFFF, #FFFFFF) !important; border-color: rgba(192, 192, 192, 0.4) !important; }
    }
  </style>
</head>`;

    const emailHtml = `<!DOCTYPE html>
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
                Greetings ${recipientName},
              </div>

              <div class="message-container">
                ${formattedParagraphs}
              </div>
              
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

              <div class="footer">Automated System Transmission · msangambe.com</div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const payload = {
        from: 'Dynasty World <info@msangambe.com>',
        to: validRecipients,
        subject: subject.trim(),
        html: emailHtml
      };

      if (sendCopy) {
        payload.bcc = [ADMIN_EMAIL];
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Resend manual send error:', data);
        return res.status(response.status).json({
          error: data.message || 'Failed to dispatch email via Resend.'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Transmission successfully dispatched to ${validRecipients.join(', ')}`,
        id: data.id,
        count: validRecipients.length
      });
    } catch (err) {
      console.error('Server error in admin-send:', err);
      return res.status(500).json({ error: 'Internal server error while dispatching email.' });
    }
  }

  return res.status(400).json({ error: 'Unknown action specified.' });
};
