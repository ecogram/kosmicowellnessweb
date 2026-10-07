require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';

async function summary() {
  try {
    await mongoose.connect(uri);
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

    const users = await User.find({}).lean();
    console.log('\n================ DATABASE ORDER SUMMARY ================');

    for (const u of users) {
      const userConditions = [
        { user: u._id },
        { user: String(u._id) },
        { userId: u._id },
        { userId: String(u._id) },
        ...(u.email ? [{ userEmail: new RegExp(`^${u.email.trim()}$`, 'i') }] : [])
      ];

      const all = await Order.find({ $or: userConditions }).sort({ createdAt: -1 }).lean();
      
      const placedPaid = all.filter(o => 
        ['Placed', 'PLACED', 'Processing', 'PROCESSING', 'DELIVERED', 'Delivered', 'SHIPPED', 'Shipped'].includes(o.orderStatus) &&
        (['Paid', 'PAID', 'PARTIAL_PAID'].includes(o.paymentStatus) || (o.paymentMethod === 'COD' && (!o.upfrontAmount || o.upfrontAmount === 0)))
      );

      const cancelledOrFailed = all.filter(o => 
        ['Cancelled', 'CANCELLED', 'PENDING'].includes(o.orderStatus) ||
        ['FAILED', 'Pending', 'PENDING'].includes(o.paymentStatus)
      );

      console.log(`\n👤 User: ${u.name} (${u.email})`);
      console.log(`   📱 Phone: ${u.phoneNumber || u.phone || 'N/A'}`);
      console.log(`   📦 Total Order Records in Database: ${all.length}`);
      console.log(`   ✅ Successful / Active Placed Orders: ${placedPaid.length}`);
      console.log(`   ❌ Cancelled / Failed / Draft Orders: ${all.length - placedPaid.length}`);
      
      if (placedPaid.length > 0) {
        console.log('   --- Successful Orders Details ---');
        placedPaid.forEach((o, idx) => {
          console.log(`      ${idx + 1}. Order ID: ${o._id} | Amount: ₹${o.total || o.amount} | Status: ${o.orderStatus} | Payment: ${o.paymentStatus} (${o.paymentMethod}) | Date: ${new Date(o.createdAt).toLocaleDateString('en-IN')}`);
        });
      }
    }
    console.log('\n========================================================\n');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

summary();
