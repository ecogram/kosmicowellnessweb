const app = require('./app');
const http = require('http');
const connectDB = require('./config/database');
const env = require('./config/env');
const mongoose = require('mongoose');

const PORT = env.PORT;

const server = http.createServer(app);

// Initialize Socket.IO
const { initializeSocket } = require('./realtime/socket');
initializeSocket(server);

// Connect to Database, then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    // Start automatic Shiprocket order sync monitoring
    try {
      const { startSyncer } = require('./services/autoShiprocketSyncer');
      startSyncer(4000);
    } catch (e) {
      console.error('Failed to start Shiprocket auto-syncer:', e.message);
    }
  });
});


// Graceful Shutdown implementation
const gracefulShutdown = async () => {
  console.log('Received shutdown signal. Closing HTTP server...');
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      
      const { redis } = require('./config/redis');
      if (redis.status === 'ready') {
        await redis.quit();
        console.log('Redis connection closed.');
      }
    } catch (err) {
      console.error('Error closing connections', err);
    }
    process.exit(0);
  });

  // Force exit if closing takes too long
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
