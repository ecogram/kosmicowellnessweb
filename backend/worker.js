require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { redisConfig } = require('./config/redis');
const notificationService = require('./services/notificationService');

console.log('Starting Kosmico Wellness Background Worker...');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Worker connected to MongoDB');
  } catch (error) {
    console.error('Worker MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Notification Worker
const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    console.log(`Processing notification job ${job.id}`);
    if (job.name === 'create-notification') {
      await notificationService._processPersistNotification(job.data);
    }
  },
  { 
    connection: redisConfig,
    concurrency: 5 // Process up to 5 notifications concurrently
  }
);

notificationWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

// Placeholder Email Worker
const emailWorker = new Worker(
  'emails',
  async (job) => {
    console.log(`Processing email job ${job.id} (No-op in Phase 13)`);
  },
  { connection: redisConfig, concurrency: 2 }
);

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down worker gracefully...`);
  
  await notificationWorker.close();
  await emailWorker.close();
  
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  
  console.log('Worker shutdown complete.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
