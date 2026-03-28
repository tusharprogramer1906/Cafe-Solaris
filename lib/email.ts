import nodemailer from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SendLeadReplyEmailInput = {
  to: string;
  leadName: string;
  reply: string;
};

let transporterCache: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporterCache) {
    return transporterCache;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("SMTP CONFIG:", {
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
  });

  if (!host || !port || !user || !pass) {
    console.error("SMTP config missing required variables.");
    return null;
  }

  transporterCache = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: false,
    auth: { user, pass },
  });

  return transporterCache;
}

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL;

  if (!transporter || !fromEmail) {
    throw new Error("SMTP transporter not configured.");
  }

  if (!to) {
    throw new Error("Recipient email is required.");
  }

  console.log("Sending email to:", to);

  const info = await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
    html: html ?? `<p>${text}</p>`,
  });

  console.log("📨 Email sent:", info.messageId);
}

export async function sendLeadReplyEmail({ to, leadName, reply }: SendLeadReplyEmailInput) {
  await sendEmail({
    to,
    subject: `Thanks for contacting us, ${leadName}`,
    text: reply,
    html: `<p>${reply}</p>`,
  });
}

