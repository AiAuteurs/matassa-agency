import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;
  const replyTo = data['a-email'] || data['b-email'] || data['c-email'] || data['email'] || '';
  const name    = data['a-name']  || data['b-name']  || data['c-name']  || data['name'] || 'Someone';
  const type    = data.inquiryType || 'New Inquiry';

  const rows = Object.entries(data)
    .filter(([k]) => k !== 'inquiryType')
    .map(([k, v]) => `
      <tr>
        <td style="padding:10px 16px;color:#888;font-size:13px;font-family:sans-serif;border-bottom:1px solid #1a1a1a;white-space:nowrap;vertical-align:top">${k}</td>
        <td style="padding:10px 16px;color:#ffffff;font-size:13px;font-family:sans-serif;border-bottom:1px solid #1a1a1a">${v || '—'}</td>
      </tr>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<body style="background:#080808;margin:0;padding:40px 20px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">
    <tr><td style="padding-bottom:28px">
      <span style="font-family:sans-serif;font-size:30px;font-weight:900;color:#8BAF8E;letter-spacing:3px">MATASSA</span>
    </td></tr>
    <tr><td style="padding-bottom:6px">
      <span style="font-family:sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#444">New Inquiry</span>
    </td></tr>
    <tr><td style="padding-bottom:28px">
      <span style="font-family:sans-serif;font-size:22px;font-weight:600;color:#ffffff">${type}</span>
    </td></tr>
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #222">${rows}</table>
    </td></tr>
    <tr><td style="padding-top:28px">
      <a href="mailto:${replyTo}" style="display:inline-block;background:#8BAF8E;color:#080808;font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 28px;text-decoration:none">Reply to ${name} →</a>
    </td></tr>
    <tr><td style="padding-top:36px;border-top:1px solid #1a1a1a;margin-top:36px">
      <span style="font-family:sans-serif;font-size:11px;color:#333">matassa.com &nbsp;·&nbsp; Traditional Craft. Cinematic A.I.</span>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"MATASSA" <${process.env.SMTP_USER}>`,
      to: 'michael@matassa.com',
      replyTo: replyTo,
      subject: `[MATASSA] ${type} — ${name}`,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('SMTP error:', e);
    return res.status(500).json({ error: 'Email failed' });
  }
}
