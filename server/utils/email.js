const nodemailer = require('nodemailer');

const { EMAIL_FROM, EMAIL_PASS } = process.env;

if (!EMAIL_FROM || !EMAIL_PASS) {
  console.error("❌ Missing EMAIL_FROM or EMAIL_PASS in environment variables");
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, 
  secure: true, 
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // helps in Railway environments
  },
  connectionTimeout: 60000, // 60s
  greetingTimeout: 30000,   // 30s
  socketTimeout: 60000,     // 60s
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