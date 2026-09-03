require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const notificationService = require('../services/notificationService');

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweet-monk';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  // Wait a sec for Redis to be ready
  await new Promise(r => setTimeout(r, 1000));
  
  // Fake User ID
  const userId = new mongoose.Types.ObjectId();
  
  await notificationService.createNotification(
    userId,
    'TEST',
    'Test Notification',
    'This is a real test job via background worker'
  );
  
  console.log('Job enqueued');
  
  // Wait to see if it succeeds
  await new Promise(r => setTimeout(r, 2000));
  
  const notifs = await mongoose.model('Notification').find({ user: userId });
  console.log('Notifications found in DB:', notifs.length);
  
  process.exit(0);
}

run().catch(console.error);
