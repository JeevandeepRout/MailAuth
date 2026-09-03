const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendOtp,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  sendCustomEmail,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/send-custom-email', protect, sendCustomEmail);

module.exports = router;
