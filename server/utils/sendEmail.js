const nodemailer = require('nodemailer');
const { getTransporter } = require('../config/mailer');

/**
 * Sends a transactional email with OTP
 * @param {Object} params
 * @param {string} params.email - Recipient email
 * @param {string} params.name - Recipient name (optional)
 * @param {string} params.type - 'VERIFY_EMAIL' | 'RESET_PASSWORD'
 * @param {string} params.otp - 6-digit OTP
 * @returns {Promise<Object>} Delivery info
 */
const sendEmail = async ({ email, name = 'User', type, otp }) => {
  const expireMinutes = process.env.OTP_EXPIRE_MINUTES || '10';

  // Always log OTP prominently to console for effortless development & debugging
  console.log('\n============================================================');
  console.log(`🔐 [MAILAUTH SECURITY CODE]`);
  console.log(`Action:    ${type}`);
  console.log(`Recipient: ${email}`);
  console.log(`🔑 OTP:    >>> ${otp} <<<`);
  console.log(`Expires:   In ${expireMinutes} minutes`);
  console.log('============================================================\n');

  let subject = '';
  let headline = '';
  let description = '';
  let buttonLabel = '';

  if (type === 'VERIFY_EMAIL') {
    subject = `${otp} is your MailAuth verification code`;
    headline = 'Verify Your Email Address';
    description = `Thank you for signing up with MailAuth! Use the 6-digit verification code below to complete your registration. This code will expire in ${expireMinutes} minutes.`;
    buttonLabel = 'Verification Code';
  } else if (type === 'RESET_PASSWORD') {
    subject = `${otp} is your MailAuth password reset code`;
    headline = 'Reset Your Password';
    description = `We received a request to reset the password for your MailAuth account. Use the 6-digit code below to set a new password. This code will expire in ${expireMinutes} minutes.`;
    buttonLabel = 'Password Reset Code';
  } else {
    subject = 'MailAuth Notification';
    headline = 'Notification';
    description = `Your one-time security code is below. It will expire in ${expireMinutes} minutes.`;
    buttonLabel = 'Security Code';
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" border="0" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #4f46e5; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">MailAuth</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">${headline}</h2>
              <p style="margin: 0 0 12px 0; color: #475569; font-size: 15px; line-height: 1.6;">Hello ${name},</p>
              <p style="margin: 0 0 28px 0; color: #475569; font-size: 15px; line-height: 1.6;">${description}</p>
              
              <div style="background-color: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1; padding: 20px; text-align: center; margin-bottom: 28px;">
                <span style="display: block; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${buttonLabel}</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 8px; display: inline-block;">${otp}</span>
              </div>
              
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                If you did not make this request, please safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} MailAuth. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Hello ${name},

${description}

Your ${buttonLabel}: ${otp} (Expires in ${expireMinutes} minutes)

If you did not request this, please ignore this email.
© ${new Date().getFullYear()} MailAuth
  `;

  const from = process.env.EMAIL_FROM || '"MailAuth" <noreply@mailauth.local>';
  const mailOptions = {
    from,
    to: email,
    subject,
    text,
    html,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉️ Ethereal Email Preview URL (${type}): ${previewUrl}`);
    }
    return { info, previewUrl };
  } catch (err) {
    console.warn(`Email delivery failed (${err.message}). OTP logged to console above.`);
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
    return { info: { messageId: 'dev-fallback' }, previewUrl: null };
  }
};

module.exports = sendEmail;
