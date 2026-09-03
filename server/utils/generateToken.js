const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for an authenticated user
 * @param {Object} user 
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'mailauth_jwt_super_secret_key_fallback';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
