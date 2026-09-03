const nodemailer = require('nodemailer');

let transporterInstance = null;

/**
 * Creates or retrieves the Nodemailer transporter
 */
const getTransporter = async () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  // 1. If Gmail or custom SMTP credentials are provided in environment
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const isGmail =
        process.env.SMTP_SERVICE === 'gmail' ||
        process.env.SMTP_HOST?.includes('gmail') ||
        process.env.SMTP_USER?.includes('@gmail.com');

      if (isGmail) {
        transporterInstance = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS.replace(/\s+/g, ''), // remove spaces from 16-char app password
          },
        });
        console.log(`✅ Configured Gmail SMTP mailer for: ${process.env.SMTP_USER}`);
      } else {
        transporterInstance = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log(`✅ Configured Custom SMTP mailer with host: ${process.env.SMTP_HOST}`);
      }

      // Verify connection configuration
      await transporterInstance.verify();
      console.log('✅ SMTP Transporter connection verified successfully!');
      return transporterInstance;
    } catch (smtpErr) {
      console.warn('⚠️ Configured SMTP verification failed:', smtpErr.message);
      console.warn('⚠️ Falling back to test/console transport until valid credentials are provided.');
    }
  }

  // 2. Try creating an Ethereal test account with a fast 4s timeout
  console.log('Attempting to initialize Ethereal test email account...');
  try {
    const testAccountPromise = nodemailer.createTestAccount();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Ethereal account creation timed out (4s)')), 4000)
    );

    const testAccount = await Promise.race([testAccountPromise, timeoutPromise]);
    transporterInstance = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`✅ Ethereal test mailer ready. User: ${testAccount.user}`);
    return transporterInstance;
  } catch (err) {
    console.warn(`⚠️ Ethereal setup skipped (${err.message}). Using built-in Console Mailer.`);
    // 3. Fallback to mock transport that logs directly to console
    transporterInstance = {
      sendMail: async (options) => {
        console.log('\n============================================================');
        console.log('📨 [CONSOLE EMAIL DELIVERY]');
        console.log(`To:      ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('------------------------------------------------------------');
        console.log(options.text || 'HTML Content');
        console.log('============================================================\n');
        return { messageId: 'console-mock-' + Date.now() };
      },
    };
    return transporterInstance;
  }
};

module.exports = { getTransporter };
