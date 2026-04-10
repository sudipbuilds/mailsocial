import { Resend } from 'resend';

import config from '@/lib/config';

const resend = new Resend(config.resend.apiKey);

const getFirstName = (fullName: string) => fullName.split(' ')[0];

export const sendEmailVerificationMail = async (email: string, otp: string) => {
  await resend.emails.send({
    from: config.resend.from,
    to: email,
    subject: `Your code: ${otp}`,
    html: `
      <p>Here's your sign-in code:</p>

      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>

      <p>It'll expire in 5 minutes. Didn't request this? Just ignore it.</p>
    `,
  });
};

export const sendPaymentSuccessEmail = async (
  email: string,
  customerName: string,
  invoiceUrl: string | null
) => {
  await resend.emails.send({
    from: config.resend.from,
    to: email,
    subject: "You're all set - Welcome to MailSocial",
    html: `
      <p>Hi ${getFirstName(customerName)},</p>

      <p>Your payment went through - you're good to go!</p>

      <p>Head over to MailSocial and sign in with the email you used at checkout. If you have any questions, just reply to this email.</p>

      ${invoiceUrl ? `<p><a href="${invoiceUrl}">Here's your invoice</a> if you need it.</p>` : ''}

      <p>Cheers,<br/>Sudip, from MailSocial</p>
    `,
  });
};

export const sendPaymentFailedEmail = async (email: string, customerName: string) => {
  await resend.emails.send({
    from: config.resend.from,
    to: email,
    subject: "Your payment didn't go through",
    html: `
      <p>Hi ${getFirstName(customerName)},</p>

      <p>Heads up - your payment didn't go through. It happens sometimes with card issues or temporary bank blocks.</p>

      <p>Want to give it another shot? If you keep running into issues, just reply here and I'll help you sort it out.</p>

      <p>Cheers,<br/>Sudip, from MailSocial</p>
    `,
  });
};

export const sendPaymentCancelledEmail = async (email: string, customerName: string) => {
  await resend.emails.send({
    from: config.resend.from,
    to: email,
    subject: "Your payment didn't go through",
    html: `
      <p>Hi ${getFirstName(customerName)},</p>

      <p>Heads up - your payment didn't go through. It happens sometimes with card issues or temporary bank blocks.</p>

      <p>Want to give it another shot? If you keep running into issues, just reply here and I'll help you sort it out.</p>

      <p>Cheers,<br/>Sudip, from MailSocial</p>
    `,
  });
};

export const sendRefundSuccessEmail = async (
  email: string,
  customerName: string,
  amount: number,
  currency: string
) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  await resend.emails.send({
    from: config.resend.from,
    to: email,
    subject: 'Your refund is on the way',
    html: `
      <p>Hi ${getFirstName(customerName)},</p>

      <p>I've processed your refund of ${formattedAmount}. It should show up in your account within 5-10 business days.</p>

      <p>Sorry to see you go! If there's anything I could have done better, I'd genuinely love to hear it - just hit reply.</p>

      <p>All the best,<br/>Sudip, from MailSocial</p>
    `,
  });
};

export const sendAccountDeletedEmail = async (email: string, customerName: string) => {
  await resend.emails.send({
    from: config.resend.from,
    to: email,
    subject: 'Your MailSocial account has been deleted',
    html: `
      <p>Hi ${getFirstName(customerName)},</p>

      <p>Your MailSocial account has been deleted.</p>

      <p>All the best,<br/>Sudip, from MailSocial</p>
    `,
  });
};
