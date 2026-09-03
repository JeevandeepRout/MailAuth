require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testDatabase() {
  try {
    console.log('--- Testing Step 2: MongoDB Connection & User Model ---');
    await connectDB();
    
    // Clean any prior test user
    await User.deleteMany({ email: 'dbtest@example.com' });
    
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    const user = await User.create({
      name: 'Test DB User',
      email: 'dbtest@example.com',
      password: hashedPassword,
      isVerified: false,
      verifyOtp: '123456',
      verifyOtpExpireAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    
    console.log('✓ Successfully created user:', user._id);
    console.log('✓ Safe user output:', JSON.stringify(user.toSafeObject()));
    
    const isMatch = await user.comparePassword('TestPass123!');
    console.log('✓ Password comparison test passed:', isMatch);
    
    const isWrongMatch = await user.comparePassword('WrongPassword');
    console.log('✓ Wrong password comparison correctly rejected:', !isWrongMatch);
    
    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('✓ Test user cleaned up.');
    
    await disconnectDB();
    console.log('✓ Step 2 verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Step 2 verification failed:', err);
    process.exit(1);
  }
}

testDatabase();
