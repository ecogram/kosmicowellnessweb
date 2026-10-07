const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico');
  const users = await mongoose.connection.collection('users').find({
    $or: [
      { isSubscribed: true },
      { subscription: { $exists: true } },
      { trialUsage: { $exists: true } },
      { isPremium: true }
    ]
  }).toArray();

  console.log('Total matching users:', users.length);
  users.forEach(u => {
    console.log('User:', u.email, {
      isSubscribed: u.isSubscribed,
      subscription: u.subscription,
      trialUsage: u.trialUsage,
      subscriptionStatus: u.subscriptionStatus
    });
  });
  process.exit(0);
}

main();
