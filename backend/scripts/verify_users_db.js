const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico');
  const users = await mongoose.connection.collection('users').find({
    email: { $in: ['abhayyt93@gmail.com', 'amitky2056@gmail.com', 'singh.nishant5653@gmail.com'] }
  }).toArray();

  console.log('=== DATABASE USER RECORDS & EXACT TRIAL CALCULATION ===');
  users.forEach(u => {
    const uUsage = u.trialUsage || { plate_scan: 0, bp_scan: 0, community_post: 0, smartwatch_connect: 0 };
    const p = Math.max(0, 2 - (uUsage.plate_scan || 0));
    const b = Math.max(0, 2 - (uUsage.bp_scan || 0));
    const c = Math.max(0, 2 - (uUsage.community_post || 0));
    const s = Math.max(0, 2 - (uUsage.smartwatch_connect || 0));
    const totalRemaining = p + b + c + s;

    console.log({
      name: u.name,
      email: u.email,
      isSubscribed: u.isSubscribed || false,
      trialUsage_Stored_In_DB: uUsage,
      trials_Remaining_Calculated: {
        plate_scan: p,
        bp_scan: b,
        community_post: c,
        smartwatch_connect: s,
        TOTAL_REMAINING: totalRemaining
      },
      website_UI_Mode: u.isSubscribed ? `Kosmico Premium (Active) • ${u.subscriptionDaysLeft || 30} days left` : `Kosmico Premium (Free Trials) • ${totalRemaining} free trials remaining`
    });
  });
  process.exit(0);
}

check();
