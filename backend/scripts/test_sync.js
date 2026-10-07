const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const https = require('https');

async function main() {
  await mongoose.connect('mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico');
  console.log('Connected to MongoDB');

  const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await mongoose.connection.collection('users').updateOne(
    { email: 'amitky2056@gmail.com' },
    {
      $set: {
        isSubscribed: true,
        is_subscribed: true,
        isPremium: true,
        premium: true,
        subscriptionStatus: 'active',
        subscription_status: 'active',
        subscriptionDaysLeft: 30,
        subscription_days_left: 30,
        subscriptionExpiresAt: expiry,
        subscription_expires_at: expiry,
        subscription: {
          status: 'active',
          isActive: true,
          plan: 'kosmico_premium_monthly',
          activatedAt: new Date(),
          expiresAt: expiry,
          trialsRemaining: 0,
          totalTrials: 8,
        },
      },
    }
  );

  console.log('MongoDB updated with all fields');

  const token = jwt.sign(
    { id: '6aa12a1fc5f7f953112a7a38', email: 'amitky2056@gmail.com' },
    'Kosmico_Secret_Key_123',
    { expiresIn: '7d' }
  );

  function get(path) {
    return new Promise((resolve) => {
      https.get(
        'https://api.kosmicowellness.com' + path,
        { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } },
        (r) => {
          let b = '';
          r.on('data', (d) => (b += d));
          r.on('end', () => {
            console.log(path, '->', b);
            resolve();
          });
        }
      );
    });
  }

  await get('/api/auth/profile');
  await get('/api/subscription/status');
  process.exit(0);
}

main();
