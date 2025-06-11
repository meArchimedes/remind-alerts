const nodemailer = require("nodemailer");

async function sendReminderEmail(userEmail, subject, emailContent) {
  // Configure Nodemailer transport
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Remind Alerts" <no-reply@remindalerts.com>`,
    to: userEmail,
    subject: subject,
    html: emailContent,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}

module.exports = sendReminderEmail;