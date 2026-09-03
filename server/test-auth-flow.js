require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const http = require('http');

let server;

async function runTests() {
  console.log('=====================================================');
  console.log('🚀 Running Full Backend Authentication Flow Tests');
  console.log('=====================================================');

  const PORT = 5001;
  process.env.PORT = PORT;
  process.env.JWT_SECRET = 'test_secret_for_automated_verification_123';
  process.env.OTP_EXPIRE_MINUTES = '10';

  const express = require('express');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const authRoutes = require('./routes/authRoutes');

  const app = express();
  await connectDB();

  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server active on port ${PORT}`);

  const baseURL = `http://127.0.0.1:${PORT}/api/auth`;

  let authCookie = '';

  const request = async (endpoint, options = {}) => {
    const url = `${baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (authCookie && !headers['Cookie'] && !options.noCookie) {
      headers['Cookie'] = authCookie;
    }

    const fetchOptions = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    // Capture set-cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader && setCookieHeader.includes('token=')) {
      authCookie = setCookieHeader.split(';')[0];
    }

    return {
      status: response.status,
      headers: response.headers,
      data,
    };
  };

  try {
    const testEmail = 'alice.auth@example.com';
    await User.deleteMany({ email: testEmail });

    // Test 1: Invalid fields
    console.log('\n[Test 1] Registration with missing fields...');
    let res = await request('/register', { method: 'POST', body: { name: '', email: '', password: '' } });
    if (res.status === 400) console.log('✓ PASS: Rejected missing fields (400)');
    else throw new Error(`Expected 400, got ${res.status}`);

    // Test 2: Weak password
    console.log('\n[Test 2] Registration with weak password...');
    res = await request('/register', { method: 'POST', body: { name: 'Alice Doe', email: testEmail, password: 'weak' } });
    if (res.status === 400) console.log('✓ PASS: Rejected weak password (400)');
    else throw new Error(`Expected 400, got ${res.status}`);

    // Test 3: Valid registration
    console.log('\n[Test 3] Valid user registration...');
    res = await request('/register', {
      method: 'POST',
      body: {
        name: 'Alice Doe',
        email: testEmail,
        password: 'Password123!',
      },
    });
    if (res.status === 201 && res.data.success) {
      console.log('✓ PASS: User registered (201 Created)');
    } else throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);

    let userInDb = await User.findOne({ email: testEmail });
    if (userInDb && !userInDb.isVerified && userInDb.verifyOtp) {
      console.log(`✓ PASS: User in DB with isVerified=false, OTP=${userInDb.verifyOtp}`);
    } else throw new Error('User DB state invalid after registration');

    // Test 4: Attempt login before verification
    console.log('\n[Test 4] Attempt login before email verification...');
    res = await request('/login', { method: 'POST', body: { email: testEmail, password: 'Password123!' } });
    if (res.status === 403 && res.data.isVerified === false) {
      console.log('✓ PASS: Login blocked for unverified user (403)');
    } else throw new Error(`Expected 403, got ${res.status}`);

    // Test 5: Verify email with wrong OTP
    console.log('\n[Test 5] Verify email with wrong OTP...');
    res = await request('/verify-email', { method: 'POST', body: { email: testEmail, otp: '000000' } });
    if (res.status === 400) console.log('✓ PASS: Wrong OTP rejected (400)');
    else throw new Error(`Expected 400, got ${res.status}`);

    // Test 6: Verify email with expired OTP
    console.log('\n[Test 6] Verify email with expired OTP...');
    userInDb.verifyOtpExpireAt = new Date(Date.now() - 5000); // 5 seconds in past
    await userInDb.save();
    res = await request('/verify-email', { method: 'POST', body: { email: testEmail, otp: userInDb.verifyOtp } });
    if (res.status === 400) console.log('✓ PASS: Expired OTP rejected (400)');
    else throw new Error(`Expected 400, got ${res.status}`);

    // Test 7: Resend OTP
    console.log('\n[Test 7] Resend OTP...');
    res = await request('/resend-otp', { method: 'POST', body: { email: testEmail } });
    if (res.status === 200) {
      userInDb = await User.findOne({ email: testEmail });
      console.log(`✓ PASS: New OTP generated: ${userInDb.verifyOtp}`);
    } else throw new Error(`Expected 200, got ${res.status}`);

    // Test 8: Verify email with correct OTP
    console.log('\n[Test 8] Verify email with correct OTP...');
    const validOtp = userInDb.verifyOtp;
    res = await request('/verify-email', { method: 'POST', body: { email: testEmail, otp: validOtp } });
    if (res.status === 200 && res.data.success) {
      userInDb = await User.findOne({ email: testEmail });
      if (userInDb.isVerified && userInDb.verifyOtp === null) {
        console.log('✓ PASS: Email verified and OTP cleared in DB');
      } else throw new Error('DB isVerified/verifyOtp not updated');
    } else throw new Error(`Expected 200, got ${res.status}`);

    // Test 9: Duplicate registration after verified
    console.log('\n[Test 9] Duplicate registration with existing verified email...');
    res = await request('/register', {
      method: 'POST',
      body: {
        name: 'Alice Fake',
        email: testEmail,
        password: 'Password123!',
      },
    });
    if (res.status === 409) console.log('✓ PASS: Duplicate email rejected (409 Conflict)');
    else throw new Error(`Expected 409, got ${res.status}`);

    // Test 10: Login with wrong password
    console.log('\n[Test 10] Login with wrong password...');
    res = await request('/login', { method: 'POST', body: { email: testEmail, password: 'WrongPassword123!' } });
    if (res.status === 401) console.log('✓ PASS: Invalid password rejected (401)');
    else throw new Error(`Expected 401, got ${res.status}`);

    // Test 11: Login with valid credentials
    console.log('\n[Test 11] Login with valid credentials...');
    res = await request('/login', { method: 'POST', body: { email: testEmail, password: 'Password123!' } });
    if (res.status === 200 && res.data.success && res.data.data.user) {
      if (authCookie && authCookie.includes('token=')) {
        console.log('✓ PASS: Logged in and received HTTP-only cookie');
      } else throw new Error('Cookie header missing');
    } else throw new Error(`Expected 200, got ${res.status}`);

    // Test 12: GET /me with auth cookie
    console.log('\n[Test 12] Access GET /me with auth cookie...');
    res = await request('/me');
    if (res.status === 200 && res.data.data.user.email === testEmail) {
      console.log('✓ PASS: /me returned authenticated user:', res.data.data.user.name);
    } else throw new Error(`Expected 200, got ${res.status}`);

    // Test 13: GET /me without cookie
    console.log('\n[Test 13] Access GET /me without auth cookie...');
    res = await request('/me', { headers: { Cookie: '' }, noCookie: true });
    if (res.status === 401) console.log('✓ PASS: Unauthenticated access rejected (401)');
    else throw new Error(`Expected 401, got ${res.status}`);

    // Test 14: Forgot password
    console.log('\n[Test 14] Forgot password request...');
    res = await request('/forgot-password', { method: 'POST', body: { email: testEmail } });
    if (res.status === 200) {
      userInDb = await User.findOne({ email: testEmail });
      console.log(`✓ PASS: Reset OTP generated: ${userInDb.resetOtp}`);
    } else throw new Error(`Expected 200, got ${res.status}`);

    // Test 15: Reset password with wrong OTP
    console.log('\n[Test 15] Reset password with wrong OTP...');
    res = await request('/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        otp: '999999',
        newPassword: 'NewPassword123!',
      },
    });
    if (res.status === 400) console.log('✓ PASS: Wrong reset OTP rejected (400)');
    else throw new Error(`Expected 400, got ${res.status}`);

    // Test 16: Reset password with valid OTP
    console.log('\n[Test 16] Reset password with valid OTP...');
    const resetOtp = userInDb.resetOtp;
    res = await request('/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        otp: resetOtp,
        newPassword: 'NewPassword123!',
      },
    });
    if (res.status === 200 && res.data.success) {
      userInDb = await User.findOne({ email: testEmail });
      if (userInDb.resetOtp === null) {
        console.log('✓ PASS: Password reset and reset OTP cleared');
      } else throw new Error('resetOtp not cleared');
    } else throw new Error(`Expected 200, got ${res.status}`);

    // Test 17: Login with old password
    console.log('\n[Test 17] Login with old password...');
    res = await request('/login', { method: 'POST', body: { email: testEmail, password: 'Password123!' } });
    if (res.status === 401) console.log('✓ PASS: Old password rejected (401)');
    else throw new Error(`Expected 401, got ${res.status}`);

    // Test 18: Login with new password
    console.log('\n[Test 18] Login with new password...');
    res = await request('/login', { method: 'POST', body: { email: testEmail, password: 'NewPassword123!' } });
    if (res.status === 200) console.log('✓ PASS: Login successful with new password (200)');
    else throw new Error(`Expected 200, got ${res.status}`);

    // Test 19: Logout
    console.log('\n[Test 19] Logout...');
    res = await request('/logout', { method: 'POST' });
    if (res.status === 200) {
      console.log('✓ PASS: Logout succeeded');
    } else throw new Error(`Expected 200, got ${res.status}`);

    console.log('\n=====================================================');
    console.log('🎉 ALL 19 BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('=====================================================');

    await User.deleteMany({ email: testEmail });
  } catch (err) {
    console.error('\n❌ Test failed with error:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit(process.exitCode || 0);
  }
}

runTests();
