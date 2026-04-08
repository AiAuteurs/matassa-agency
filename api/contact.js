export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;
  const replyTo = data['a-email'] || data['b-email'] || data['c-email'] || '';
  const name    = data['a-name']  || data['b-name']  || data['c-name']  || 'Someone';
  const type    = data.inquiryType || 'New Inquiry';

  const rows = Object.entries(data)
    .filter(([k]) => k !== 'inquiryType')
    .map(([k, v]) => `<tr><td style="padding:8px 12px;color:#888;font-size:13px;font-family:sans-serif;border-bottom:1px solid #1a1a1a;white-space:nowrap">${k}</td><td style="padding:8px 12px;color:#fff;font-size:13px;font-family:sans-serif;border-bottom:1px solid #1a1a1a">${v || '—'}</td></tr>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<body style="background:#080808;margin:0;padding:40px 20px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">
    <tr><td style="padding-bottom:32px">
      <span style="font-family:sans-serif;font-size:28px;font-weight:900;color:#8BAF8E;letter-spacing:2px">MATASSA</span>
    </td></tr>
    <tr><td style="padding-bottom:8px">
      <span style="font-family:sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555">New Inquiry</span>
    </td></tr>
    <tr><td style="padding-bottom:32px">
      <span style="font-family:sans-serif;font-size:22px;font-weight:600;color:#fff">${type}</span>
    </td></tr>
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #1a1a1a">
        ${rows}
      </table>
    </td></tr>
    <tr><td style="padding-top:32px">
      <a href="mailto:${replyTo}" style="display:inline-block;background:#8BAF8E;color:#080808;font-family:sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 28px;text-decoration:none">Reply to ${name} →</a>
    </td></tr>
    <tr><td style="padding-top:40px">
      <span style="font-family:sans-serif;font-size:11px;color:#333">matassa.com &nbsp;·&nbsp; Traditional Craft. Cinematic A.I.</span>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MATASSA <hello@matassa.com>',
        to: ['michael@matassa.com'],
        reply_to: replyTo,
        subject: `[MATASSA] ${type} — ${name}`,
        html
      })
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
