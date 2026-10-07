require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';

async function inspectAmitOrders() {
  try {
    await mongoose.connect(uri);
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const user = await User.findOne({ email: new RegExp('^amitky2056@gmail.com$', 'i') }).lean();
    console.log('User:', user?.name, user?.email, user?._id);

    const userConditions = [
      { user: user._id },
      { user: String(user._id) },
      { userId: user._id },
      { userId: String(user._id) },
      { userEmail: new RegExp('^amitky2056@gmail.com$', 'i') }
    ];

    const allOrders = await Order.find({ $or: userConditions }).sort({ createdAt: -1 }).lean();
    console.log(`\nTotal Orders in DB for Amit Kumar: ${allOrders.length}\n`);

    allOrders.forEach((o, i) => {
      console.log(`[#${i + 1}] ID: ${o._id} | OrderNo: ${o.orderNumber || 'N/A'}`);
      console.log(`     orderStatus: "${o.orderStatus}" | paymentStatus: "${o.paymentStatus}" | paymentMethod: "${o.paymentMethod}"`);
      console.log(`     upfrontAmount: ${o.upfrontAmount} | upfrontPaymentStatus: "${o.upfrontPaymentStatus}" | total: ₹${o.total || o.amount}`);
      console.log(`     createdAt: ${o.createdAt}`);
      console.log('---------------------------------------------------------');
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

inspectAmitOrders();
