const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

// Only create transporter if SMTP is configured
if (config.smtp.host && config.smtp.user) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

/**
 * Send email notification
 * Falls back to console.log if SMTP is not configured
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`[EMAIL PLACEHOLDER] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL PLACEHOLDER] Body: ${html}`);
    return { success: true, placeholder: true };
  }

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send verification status notification to maker
 */
const sendStatusNotification = async (makerEmail, makerName, status, remarks = '') => {
  const statusColor = status === 'verified' ? '#10B981' : '#EF4444';
  const statusText = status === 'verified' ? 'Approved' : 'Rejected';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1E3A5F; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Identity Verification Update</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p>Dear ${makerName},</p>
        <p>Your identity verification request has been reviewed.</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="background: ${statusColor}; color: white; padding: 10px 30px; border-radius: 20px; font-size: 18px; font-weight: bold;">
            ${statusText}
          </span>
        </div>
        ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
        <p>Please log in to your account for more details.</p>
      </div>
      <div style="background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>This is an automated notification from the Identity Verification System.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: makerEmail,
    subject: `Identity Verification ${statusText}`,
    html,
  });
};

module.exports = { sendEmail, sendStatusNotification };
