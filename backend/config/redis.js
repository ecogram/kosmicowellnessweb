const EventEmitter = require('events');

// In-Memory Fallback Cache for local development without Redis
class InMemoryRedis extends EventEmitter {
  constructor() {
    super();
    this.store = new Map();
    this.status = 'ready';
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value, ...args) {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key) {
    return this.store.delete(key) ? 1 : 0;
  }

  async quit() {
    this.store.clear();
    return 'OK';
  }

  duplicate() {
    return new InMemoryRedis();
  }
}

let redis;
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
};

if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  try {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    redis.on('error', () => {});
    redis.connect().catch(() => {});
  } catch (e) {
    redis = new InMemoryRedis();
  }
} else {
  // Use zero-overhead in-memory cache in local dev
  redis = new InMemoryRedis();
}

module.exports = {
  redis,
  redisConfig,
};
