const mongoose = require('mongoose');

let mongod = null;
let isConnected = false;
let databaseType = 'unknown';

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', false);
  const uri = process.env.MONGODB_URI?.trim();
  const isCustomUri = uri && !uri.includes('127.0.0.1:27017') && !uri.includes('localhost:27017');

  // If user provided a custom database connection string (e.g. MongoDB Atlas or custom remote DB)
  if (isCustomUri) {
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:******@');
    console.log(`\n🔌 Connecting to your custom database: ${maskedUri}`);

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000, // 10s for remote cloud handshake
      });

      isConnected = true;
      databaseType = uri.startsWith('mongodb+srv://') ? 'MongoDB Atlas (Cloud)' : 'Custom MongoDB';
      console.log(`✅ Successfully connected to ${databaseType}!`);
      console.log(`📂 Database Name: "${mongoose.connection.name}" on host: ${mongoose.connection.host}\n`);
      return mongoose.connection;
    } catch (err) {
      console.error(`\n❌ Failed to connect to your custom database (${maskedUri}):`);
      console.error(`Error details: ${err.message}`);

      if (uri.includes('mongodb+srv://') || uri.includes('mongodb.net')) {
        console.error('\n💡 MongoDB Atlas Troubleshooting Tips:');
        console.error('  1. Check Network Access: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).');
        console.error('  2. Check Database User: Go to Database Access -> Verify username and password (avoid special characters or URL-encode them).');
        console.error('  3. Check Database Name: Ensure your connection string includes a database name before the "?" (e.g., mongodb.net/mailauth?retryWrites=true).\n');
      }

      // If user wants to force custom DB without fallback
      if (process.env.STRICT_DB === 'true' || process.env.NODE_ENV === 'production') {
        throw err;
      }

      console.warn('⚠️ Falling back to temporary in-memory database so you can keep developing...');
    }
  } else if (uri) {
    // Attempt local MongoDB instance (127.0.0.1:27017)
    try {
      console.log(`Checking local MongoDB connection at ${uri}...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500,
      });

      isConnected = true;
      databaseType = 'Local MongoDB';
      console.log(`✅ Connected to Local MongoDB on host: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (err) {
      console.warn(`Local MongoDB (27017) not running (${err.message}).`);
    }
  }

  // Fallback: In-memory MongoDB instance for seamless local development
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('⚡ Starting in-memory MongoDB instance for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      isConnected = true;
      databaseType = 'In-Memory Development Database';
      console.log(`✅ In-memory database connected and ready: ${memUri}`);
      console.log(`💡 To connect your own permanent database, set MONGODB_URI in server/.env\n`);
      return mongoose.connection;
    } catch (memErr) {
      console.error('Fatal: In-memory MongoDB failed to initialize:', memErr.message);
      throw memErr;
    }
  } else {
    throw new Error('Fatal: No MongoDB connection available in production.');
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
    isConnected = false;
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err.message);
  }
};

const getDatabaseInfo = () => ({
  isConnected,
  databaseType,
  databaseName: mongoose.connection?.name || 'none',
  host: mongoose.connection?.host || 'none',
});

module.exports = { connectDB, disconnectDB, getDatabaseInfo };
