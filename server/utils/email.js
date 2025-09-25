const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const provider = process.env.EMAIL_PROVIDER || "gmail"; // default gmail

async function sendEmail({ to, subject, html }) {
  if (provider === "gmail") {
    const { EMAIL_FROM, EMAIL_PASS } = process.env;

    if (!EMAIL_FROM || !EMAIL_PASS) {
      throw new Error("❌ Missing EMAIL_FROM or EMAIL_PASS for Gmail");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_FROM,
        pass: EMAIL_PASS,
      },
    });

    return transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
  }

  if (provider === "sendgrid") {
    const { SENDGRID_API_KEY, SENDGRID_FROM } = process.env;

    if (!SENDGRID_API_KEY || !SENDGRID_FROM) {
      throw new Error("❌ Missing SENDGRID_API_KEY or SENDGRID_FROM for SendGrid");
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    const msg = {
      to,
      from: SENDGRID_FROM,
      subject,
      html,
    };

    return sgMail.send(msg);
  }

  throw new Error("❌ No valid email provider configured");
}

module.exports = sendEmail;