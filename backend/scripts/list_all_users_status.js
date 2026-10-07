const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico');
  const users = await mongoose.connection.collection('users').find({}).sort({ createdAt: -1 }).toArray();

  console.log('TOTAL_USERS_COUNT:', users.length);
  const result = users.map((u, i) => {
    const usage = u.trialUsage || { plate_scan: 0, bp_scan: 0, community_post: 0, smartwatch_connect: 0 };
    const p = Math.max(0, 2 - (Number(usage.plate_scan) || 0));
    const b = Math.max(0, 2 - (Number(usage.bp_scan) || 0));
    const c = Math.max(0, 2 - (Number(usage.community_post) || 0));
    const s = Math.max(0, 2 - (Number(usage.smartwatch_connect) || 0));
    const totalRemaining = p + b + c + s;

    const isSub = Boolean(
      u.isSubscribed === true ||
      u.isSubscribed === 'true' ||
      u.subscriptionStatus === 'active' ||
      u.subscription?.isActive === true ||
      u.subscription?.status === 'active' ||
      u.isPremium === true
    );

    return {
      index: i + 1,
      id: u._id.toString(),
      name: u.name || u.fullName || 'N/A',
      email: u.email || 'N/A',
      phone: u.phoneNumber || u.phone || 'N/A',
      isSubscribed: isSub,
      subscriptionDaysLeft: isSub ? (u.subscriptionDaysLeft || 30) : 0,
      trialsUsed: usage,
      trialsRemaining: {
        plate_scan: p,
        bp_scan: b,
        community_post: c,
        smartwatch_connect: s,
        total: totalRemaining
      },
      displayStatus: isSub
        ? `Kosmico Premium (Active) • ${u.subscriptionDaysLeft || 30} days left`
        : `Kosmico Premium (Free Trials) • ${totalRemaining} free trials remaining`
    };
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main();
