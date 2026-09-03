require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category'); // Add this to prevent MissingSchemaError when Product populates
const { redis } = require('../config/redis');
const cacheService = require('../services/cacheService');
const productService = require('../services/productService');
const notificationService = require('../services/notificationService');
const { notificationQueue } = require('../jobs/queue');

const runTests = async () => {
  // Wait for Redis connection to settle
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');

  if (redis.status === 'ready') {
    console.log('\n--- 1. TEST REDIS CACHE OPERATIONS ---');
    await cacheService.set('test:key', { message: 'hello' }, 10);
    let val = await cacheService.get('test:key');
    console.log('Cache SET/GET:', val);
    
    await cacheService.delete('test:key');
    val = await cacheService.get('test:key');
    console.log('Cache DELETE:', val);
  } else {
    console.log('\n--- 1. REDIS UNAVAILABLE: VERIFYING GRACEFUL DEGRADATION ---');
  }

  console.log('\n--- 2. TEST PRODUCT CACHE HIT/MISS (OR FALLBACK) ---');
  let start = Date.now();
  await productService.getAllProducts({});
  console.log(`First fetch took: ${Date.now() - start}ms`);

  start = Date.now();
  await productService.getAllProducts({});
  console.log(`Second fetch took: ${Date.now() - start}ms`);

  console.log('\n--- 3. TEST BULLMQ JOB ENQUEUE (OR FALLBACK) ---');
  // Add a test notification
  const jobId = await notificationService.createNotification(
    new mongoose.Types.ObjectId(), 
    'ORDER_CREATED', 
    'Test Notification', 
    'Testing BullMQ Enqueue',
    { orderId: 'test-123' }
  );
  
  console.log(`Enqueued Notification Job (or safe ignore)? ${jobId ? 'YES' : 'NO/IGNORED'}`);

  console.log(`Enqueued Notification Job (or safe ignore)? ${jobId ? 'YES' : 'NO/IGNORED'}`);

  await mongoose.connection.close();
  
  // Force exit because bullmq internal redis client ignores process.exit(0) when disconnected
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

runTests().catch(console.error);
