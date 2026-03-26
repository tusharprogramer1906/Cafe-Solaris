import nodemailer from "nodemailer";

type SendLeadReplyEmailInput = {
  to: string;
  leadName: string;
  reply: string;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
}

export async function sendLeadReplyEmail({ to, leadName, reply }: SendLeadReplyEmailInput) {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL;

  if (!transporter || !fromEmail) {
    return;
  }

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: `Thanks for contacting us, ${leadName}`,
    text: reply,
    html: `<p>${reply}</p>`,
  });
}

