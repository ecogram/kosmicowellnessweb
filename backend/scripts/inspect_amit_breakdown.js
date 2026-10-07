require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';

async function breakdown() {
  try {
    await mongoose.connect(uri);
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const user = await User.findOne({ email: new RegExp('^amitky2056@gmail.com$', 'i') }).lean();
    const userConditions = [
      { user: user._id },
      { user: String(user._id) },
      { userId: user._id },
      { userId: String(user._id) },
      { userEmail: new RegExp('^amitky2056@gmail.com$', 'i') }
    ];

    const all = await Order.find({ $or: userConditions }).sort({ createdAt: -1 }).lean();

    const paidOrders = all.filter(o => 
      ['Paid', 'PAID', 'PARTIAL_PAID'].includes(o.paymentStatus) || 
      String(o.upfrontPaymentStatus || '').toUpperCase() === 'PAID'
    );

    const unpaidDrafts = all.filter(o => 
      !['Paid', 'PAID', 'PARTIAL_PAID'].includes(o.paymentStatus) && 
      String(o.upfrontPaymentStatus || '').toUpperCase() !== 'PAID'
    );

    console.log(`\nTotal Orders in DB for Amit Kumar: ${all.length}`);
    console.log(`1. Orders with Successful Payment (paymentStatus === 'Paid'): ${paidOrders.length}`);
    console.log(`2. Orders where Payment was Pending / Failed (Never Paid): ${unpaidDrafts.length}`);

    console.log('\n================ 25 PAID ORDERS (SHOWING IN MY ORDERS) ================');
    paidOrders.forEach((o, i) => {
      console.log(`${i + 1}. ID: ${o._id} | OrderNo: ${o.orderNumber || 'N/A'} | Status: ${o.orderStatus} | Payment: ${o.paymentStatus} (${o.paymentMethod}) | Amount: ₹${o.total || o.amount} | Date: ${new Date(o.createdAt).toLocaleString('en-IN')}`);
    });

    console.log('\n================ 9 UNPAID DRAFTS (EXCLUDED / PAYMENT PENDING) ================');
    unpaidDrafts.forEach((o, i) => {
      console.log(`${i + 1}. ID: ${o._id} | OrderNo: ${o.orderNumber || 'N/A'} | Status: ${o.orderStatus} | Payment: ${o.paymentStatus} (${o.paymentMethod}) | UpfrontPayment: ${o.upfrontPaymentStatus} | Amount: ₹${o.total || o.amount} | Date: ${new Date(o.createdAt).toLocaleString('en-IN')}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

breakdown();
