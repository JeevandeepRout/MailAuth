require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { connectDB, getDatabaseInfo } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const dbInfo = getDatabaseInfo();

  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    message: dbReady ? 'MailAuth API is running smoothly' : 'Database connection initializing...',
    database: {
      status: dbReady ? 'connected' : 'connecting',
      type: dbInfo.databaseType,
      name: dbInfo.databaseName,
      host: dbInfo.host,
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);

// 404 Catch-all handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start Server after connecting to Database
async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      const dbInfo = getDatabaseInfo();
      console.log(`\n🚀 MailAuth backend server listening on port ${PORT}`);
      console.log(`📦 Database: ${dbInfo.databaseType} ("${dbInfo.databaseName}")`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health\n`);
    });
    return server;
  } catch (err) {
    console.error('Fatal: Failed to start server due to DB connection error:', err);
    process.exit(1);
  }
}

const serverPromise = startServer();

module.exports = { app, startServer, serverPromise };
