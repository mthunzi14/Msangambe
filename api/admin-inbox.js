// Vercel Serverless Function: api/admin-inbox.js
// Connects to the domain IMAP mail server (mail.msangambe.com:993) to fetch and view inbox emails.

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

const IMAP_HOST = 'mail.msangambe.com';
const IMAP_PORT = 993;
const IMAP_USER = 'info@msangambe.com';
const IMAP_PASS = 'Dynasty@WORLD2026';

const AUTH_TOKEN_PREFIX = 'dynasty_auth_token_sigudla_';

function isAuthorized(authHeader, password) {
  if (password && password === IMAP_PASS) return true;
  if (authHeader && authHeader.startsWith(AUTH_TOKEN_PREFIX)) return true;
  return false;
}

function getImapClient() {
  return new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: {
      user: IMAP_USER,
      pass: IMAP_PASS
    },
    logger: false,
    tls: {
      rejectUnauthorized: false
    }
  });
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

  const { action, password, uid, limit } = req.body || {};
  const authHeader = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';

  if (!isAuthorized(authHeader, password)) {
    return res.status(401).json({ error: 'Unauthorized session. Please log in.' });
  }

  const client = getImapClient();

  try {
    await client.connect();

    // 1. ACTION: LIST MESSAGES
    if (action === 'list' || !action) {
      const lock = await client.getMailboxLock('INBOX');
      const messages = [];

      try {
        const total = client.mailbox.exists;
        const fetchLimit = Math.min(limit || 30, total);

        if (total > 0) {
          const start = Math.max(1, total - fetchLimit + 1);
          const range = `${start}:${total}`;

          for await (let msg of client.fetch(range, { envelope: true, flags: true, uid: true })) {
            messages.unshift({
              seq: msg.seq,
              uid: msg.uid,
              date: msg.envelope.date ? msg.envelope.date.toISOString() : null,
              subject: msg.envelope.subject || '(No Subject)',
              from: msg.envelope.from && msg.envelope.from[0] ? {
                name: msg.envelope.from[0].name || '',
                address: msg.envelope.from[0].address || ''
              } : { name: '', address: 'Unknown' },
              to: msg.envelope.to ? msg.envelope.to.map(t => t.address).join(', ') : '',
              seen: msg.flags.has('\\Seen')
            });
          }
        }

        return res.status(200).json({
          success: true,
          total,
          messages
        });
      } finally {
        lock.release();
        await client.logout();
      }
    }

    // 2. ACTION: READ SINGLE MESSAGE
    if (action === 'read') {
      if (!uid) {
        await client.logout();
        return res.status(400).json({ error: 'Message UID is required.' });
      }

      const lock = await client.getMailboxLock('INBOX');
      try {
        const download = await client.download(uid.toString(), { uid: true });
        if (!download || !download.content) {
          return res.status(404).json({ error: 'Email message not found.' });
        }

        const parsed = await simpleParser(download.content);

        const attachments = (parsed.attachments || []).map(att => ({
          filename: att.filename || 'attachment',
          contentType: att.contentType,
          size: att.size,
          content: att.content ? att.content.toString('base64') : ''
        }));

        return res.status(200).json({
          success: true,
          email: {
            uid,
            subject: parsed.subject || '(No Subject)',
            from: parsed.from ? parsed.from.text : '',
            to: parsed.to ? parsed.to.text : '',
            date: parsed.date ? parsed.date.toISOString() : null,
            text: parsed.text || '',
            html: parsed.html || '',
            attachments
          }
        });
      } finally {
        lock.release();
        await client.logout();
      }
    }

    await client.logout();
    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('IMAP Serverless error:', err);
    try { await client.logout(); } catch (e) {}
    return res.status(500).json({ error: 'Failed to communicate with mail server: ' + err.message });
  }
};
