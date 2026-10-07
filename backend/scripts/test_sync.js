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
        subscriptionStatus: 'active',
        subscriptionDaysLeft: 30,
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

  console.log('MongoDB record updated for amitky2056@gmail.com');

  const user = await mongoose.connection.collection('users').findOne({ email: 'amitky2056@gmail.com' });
  console.log('DB USER:', {
    email: user.email,
    isSubscribed: user.isSubscribed,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionDaysLeft: user.subscriptionDaysLeft,
    subscription: user.subscription,
  });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email },
    'Kosmico_Secret_Key_123',
    { expiresIn: '7d' }
  );

  const req = https.request(
    'https://api.kosmicowellness.com/api/auth/profile',
    {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    },
    (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        console.log('LIVE SERVER /api/auth/profile RESPONSE:');
        console.log(body);
        process.exit(0);
      });
    }
  );
  req.on('error', (e) => {
    console.error(e);
    process.exit(1);
  });
  req.end();
}

main();
