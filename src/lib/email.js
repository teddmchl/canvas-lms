import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  // If SMTP is not configured, we mock the email to the server console for V1 development
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n================================`);
    console.log(`💌 [MOCK EMAIL DISPATCHED]`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`--------------------------------`);
    console.log(html.replace(/<[^>]*>?/gm, '')); // rough text strip
    console.log(`================================\n`);
    return { mock: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Canvas LMS" <noreply@canvas-lms.demo>',
    to,
    subject,
    html,
  });
}
