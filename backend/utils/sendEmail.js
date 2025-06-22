// utils/sendEmail.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  const fromEmail = process.env.SENDGRID_SENDER_EMAIL;

  if (!fromEmail) {
    throw new Error('Missing SENDGRID_SENDER_EMAIL in environment variables');
  }

  const msg = {
    to,
    from: { email: fromEmail, name: 'Tassot' }, // ✅ FIXED HERE
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error.response?.body || error.message);
    throw new Error('Email sending failed');
  }
};
