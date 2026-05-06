import http from 'node:http';
import nodemailer from 'nodemailer';

const PORT = Number(process.env.PORT || 8787);
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true') === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const MAIL_TO = process.env.MAIL_TO || SMTP_USER;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';
const SUBJECT = process.env.LEADS_SUBJECT || 'Заявка с сайта';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
  console.error('Missing SMTP configuration. Check SMTP_HOST/SMTP_USER/SMTP_PASS/MAIL_TO.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function sanitize(value, max = 250) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

const recentByIp = new Map();
const MIN_INTERVAL_MS = 20_000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    return json(res, 200, { ok: true });
  }

  if (req.method !== 'POST' || url.pathname !== '/api/lead') {
    return json(res, 404, { ok: false, error: 'Not found' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const last = recentByIp.get(ip) || 0;
  if (now - last < MIN_INTERVAL_MS) {
    return json(res, 429, { ok: false, error: 'Too many requests' });
  }
  recentByIp.set(ip, now);

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 30_000) req.destroy();
  });

  req.on('end', async () => {
    try {
      const payload = JSON.parse(raw || '{}');
      const name = sanitize(payload.name, 120);
      const phone = sanitize(payload.phone, 120);
      const channel = sanitize(payload.channel, 80);

      if (!name || !phone || !channel) {
        return json(res, 400, { ok: false, error: 'Invalid payload' });
      }

      const text = [
        'Новая заявка с сайта',
        '',
        `Имя: ${name}`,
        `Телефон/ID: ${phone}`,
        `Куда написать: ${channel}`,
        `Время: ${new Date().toISOString()}`,
        `IP: ${ip}`,
      ].join('\n');

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        subject: SUBJECT,
        text,
      });

      return json(res, 200, { ok: true });
    } catch (error) {
      console.error('Lead submit error:', error);
      return json(res, 500, { ok: false, error: 'Internal error' });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Leads API listening on ${PORT}`);
});
