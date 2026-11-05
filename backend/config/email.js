import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// The address every outbound mail is sent from. Resend will reject anything
// that is not a verified domain, so the fallback is Resend's own test sender,
// which works out of the box but can only deliver to the account owner.
export const EMAIL_FROM =
  process.env.EMAIL_FROM || process.env.SMTP_USER || 'VoltSupply <onboarding@resend.dev>';

let transporter;

// Fail fast when the SMTP server is unreachable (e.g. blank credentials or a
// blocked outbound port on the host) instead of nodemailer's ~2 minute default,
// which held requests open long enough to hit upstream proxy timeouts.
const smtpTimeouts = {
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
};

// Resend over HTTPS rather than SMTP. Hosts commonly block outbound 465/587
// (this is exactly why SMTP delivery was timing out on Render), and nothing
// blocks 443 - so the API path is the one that actually delivers in
// production. Exposes sendMail() so callers do not care which backend is live.
function createResendTransport(apiKey) {
  return {
    async sendMail({ from, to, subject, html, text }) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: from || EMAIL_FROM,
          to: Array.isArray(to) ? to : [to],
          subject,
          ...(html ? { html } : {}),
          ...(text ? { text } : {}),
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Resend API ${res.status}: ${detail.slice(0, 300)}`);
      }

      return res.json();
    },
  };
}

if (process.env.RESEND_API_KEY && process.env.EMAIL_PROVIDER !== 'smtp') {
  transporter = createResendTransport(process.env.RESEND_API_KEY);
  console.log('📧 Email provider: Resend (HTTPS API)');
} else if (process.env.EMAIL_PROVIDER === 'resend') {
  // Explicitly asked for Resend but no API key was supplied.
  console.warn('⚠️  EMAIL_PROVIDER=resend but RESEND_API_KEY is not set - email will fail.');
  transporter = createResendTransport(process.env.RESEND_API_KEY ?? '');
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    ...smtpTimeouts,
  });
  console.log(`📧 Email provider: SMTP (${process.env.SMTP_HOST || 'smtp.gmail.com'})`);
}

// Send OTP email
export const sendOTPEmail = async (email, otp, subject = null, html = null) => {
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: subject || 'VoltSupply - Your OTP Code',
    html: html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your OTP Code</h2>
        <p>Your OTP code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
        <p>This code is valid for 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

export default transporter;
