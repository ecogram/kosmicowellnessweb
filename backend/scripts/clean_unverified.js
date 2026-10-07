require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';

async function cleanUnverified() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    
    // Find unverified upfront orders
    const result = await Order.updateMany(
      {
        upfrontAmount: { $gt: 0 },
        upfrontPaymentStatus: { $ne: 'Paid' },
        paymentStatus: { $nin: ['PAID', 'PARTIAL_PAID', 'Paid'] }
      },
      {
        $set: {
          orderStatus: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      }
    );
    console.log('Successfully cancelled unverified partial COD attempts:', result);

    // Also cancel unverified online payment attempts
    const result2 = await Order.updateMany(
      {
        paymentMethod: { $in: ['ONLINE', 'ONLINE_PREPAID', 'RAZORPAY', 'razorpay'] },
        paymentStatus: { $nin: ['PAID', 'COMPLETED', 'Paid'] },
        orderStatus: { $in: ['PENDING', 'Placed', 'Processing'] }
      },
      {
        $set: {
          orderStatus: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      }
    );
    console.log('Successfully cancelled unverified online attempts:', result2);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error cleaning unverified orders:', err);
    process.exit(1);
  }
}

cleanUnverified();
