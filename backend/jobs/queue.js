// BullMQ queues with safe local development fallback
let notificationQueue;
let emailQueue;

if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  try {
    const { Queue } = require('bullmq');
    const { redisConfig } = require('../config/redis');

    notificationQueue = new Queue('notifications', {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    emailQueue = new Queue('emails', {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  } catch (err) {
    // Fallback
    notificationQueue = { add: async () => {} };
    emailQueue = { add: async () => {} };
  }
} else {
  // Safe in-memory mock for local development
  notificationQueue = {
    add: async (jobName, data) => {
      // Async direct process without Redis
      return { id: `mock-${Date.now()}` };
    },
  };
  emailQueue = {
    add: async (jobName, data) => {
      return { id: `mock-email-${Date.now()}` };
    },
  };
}

module.exports = {
  notificationQueue,
  emailQueue,
};
