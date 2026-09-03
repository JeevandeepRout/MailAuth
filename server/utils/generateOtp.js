const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit numeric OTP string
 * @returns {string} 6-digit OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = generateOtp;
