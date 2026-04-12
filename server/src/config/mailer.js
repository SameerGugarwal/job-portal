const nodemailer = require("nodemailer");

// Create reusable transporter using Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using the configured transporter.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - Email body (HTML)
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "noreply@jobportal.com",
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    // Log but don't crash the request — email is non-critical
    console.error("Email send failed:", err.message);
  }
};

module.exports = sendEmail;
