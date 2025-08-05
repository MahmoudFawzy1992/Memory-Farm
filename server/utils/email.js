const nodemailer = require('nodemailer');

const { EMAIL_FROM, EMAIL_PASS } = process.env;

if (!EMAIL_FROM || !EMAIL_PASS) {
  console.error("❌ Missing EMAIL_FROM or EMAIL_PASS in environment variables");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    throw new Error('Email failed to send');
  }
}

module.exports = sendEmail;