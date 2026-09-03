const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// Helper to validate password complexity
const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

// Helper to set auth cookie
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
  res.cookie('token', token, cookieOptions);
};

// Helper to clear auth cookie
const clearAuthCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
  });
};

/**
 * @desc    Register a new user & send verification OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters',
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      });
    }

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      // If user exists and is already verified
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // If user registered before but never verified, update details, refresh OTP & resend
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOtp();
      const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);
      const otpExpireAt = new Date(Date.now() + expireMinutes * 60 * 1000);

      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.verifyOtp = otp;
      existingUser.verifyOtpExpireAt = otpExpireAt;

      // Send verification email
      try {
        await sendEmail({
          email: normalizedEmail,
          name: name.trim(),
          type: 'VERIFY_EMAIL',
          otp,
        });
      } catch (mailErr) {
        console.error('Email delivery error during re-registration:', mailErr.message);
      }

      await existingUser.save();

      return res.status(201).json({
        success: true,
        message: 'Registration initiated! Please check your email or server console for the 6-digit verification code.',
        data: {
          email: existingUser.email,
          devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        },
      });
    }

    // 3. Create fresh user
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);
    const otpExpireAt = new Date(Date.now() + expireMinutes * 60 * 1000);

    // Send verification email
    try {
      await sendEmail({
        email: normalizedEmail,
        name: name.trim(),
        type: 'VERIFY_EMAIL',
        otp,
      });
    } catch (mailErr) {
      console.error('Email delivery error during registration:', mailErr.message);
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verifyOtp: otp,
      verifyOtpExpireAt: otpExpireAt,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email or server console for the 6-digit verification code.',
      data: {
        email: newUser.email,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      },
    });
  } catch (err) {
    console.error('Registration error stack:', err);

    // Handle MongoDB duplicate key error specifically
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Handle Mongoose schema validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected server error occurred during registration',
    });
  }
};

/**
 * @desc    Verify email using 6-digit OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and verification code',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified. You can log in directly.',
      });
    }

    // Check OTP match
    if (!user.verifyOtp || user.verifyOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
      });
    }

    // Check expiration
    if (!user.verifyOtpExpireAt || new Date() > user.verifyOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Mark verified and clear OTP fields
    user.isVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpireAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during verification',
    });
  }
};

/**
 * @desc    Resend verification OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified. You can log in directly.',
      });
    }

    const otp = generateOtp();
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);
    const otpExpireAt = new Date(Date.now() + expireMinutes * 60 * 1000);

    // Invalidate previous OTP by overwriting
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpireAt;

    try {
      await sendEmail({
        email: normalizedEmail,
        name: user.name,
        type: 'VERIFY_EMAIL',
        otp,
      });
    } catch (mailErr) {
      console.error('Resend OTP email delivery error:', mailErr);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'A fresh verification code has been sent to your email (or server console).',
      data: {
        email: user.email,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      },
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while resending code',
    });
  }
};

/**
 * @desc    Authenticate user & set HTTP-only cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Validate email existence & password match
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check verification status
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email is not verified yet. Please complete verification to access your account.',
        isVerified: false,
        email: user.email,
      });
    }

    // Generate JWT and set cookie
    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during login',
    });
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private (Protected by authMiddleware)
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
      },
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
    });
  }
};

/**
 * @desc    Log out user & clear HTTP-only cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during logout',
    });
  }
};

/**
 * @desc    Initiate password reset (send OTP)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    let otp = null;

    // For security, always return generic success
    if (user) {
      otp = generateOtp();
      const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);
      const otpExpireAt = new Date(Date.now() + expireMinutes * 60 * 1000);

      user.resetOtp = otp;
      user.resetOtpExpireAt = otpExpireAt;
      await user.save();

      try {
        await sendEmail({
          email: normalizedEmail,
          name: user.name,
          type: 'RESET_PASSWORD',
          otp,
        });
      } catch (mailErr) {
        console.error('Reset password email delivery error:', mailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset code has been sent.',
      data: {
        email: normalizedEmail,
        devOtp: process.env.NODE_ENV !== 'production' && otp ? otp : undefined,
      },
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred. Please try again.',
    });
  }
};

/**
 * @desc    Reset password using valid OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, reset code, and new password',
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or reset code',
      });
    }

    // Check OTP
    if (!user.resetOtp || user.resetOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code. Please check and try again.',
      });
    }

    // Check expiration
    if (!user.resetOtpExpireAt || new Date() > user.resetOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new code.',
      });
    }

    // Hash new password and clear reset OTP fields
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpireAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while resetting password',
    });
  }
};

/**
 * @desc    Send a custom email from the authenticated dashboard
 * @route   POST /api/auth/send-custom-email
 * @access  Private
 */
const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient email, subject, and message content',
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(to.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid recipient email address',
      });
    }

    const { getTransporter } = require('../config/mailer');
    const transporter = await getTransporter();
    const from = process.env.EMAIL_FROM || '"MailAuth" <noreply@mailauth.local>';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580px" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #4f46e5; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">MailAuth Message</h1>
              <p style="margin: 4px 0 0 0; color: #e0e7ff; font-size: 13px;">Sent by ${req.user.name} (${req.user.email})</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 600;">${subject}</h2>
              <div style="color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">This email was sent via the MailAuth platform.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to: to.trim(),
      subject,
      text: `${message}\n\nSent by ${req.user.name} (${req.user.email}) via MailAuth`,
      html,
    });

    console.log(`✉️ Custom email sent from ${req.user.email} to ${to.trim()}`);
    return res.status(200).json({
      success: true,
      message: `Email successfully sent to ${to.trim()}!`,
    });
  } catch (err) {
    console.error('Send custom email error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to send custom email',
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  sendCustomEmail,
};
