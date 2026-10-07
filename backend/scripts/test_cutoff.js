require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';

async function testFilter() {
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

    const cutoffDate = new Date('2026-10-06T23:59:59.999Z');

    const query = {
      $and: [
        { $or: userConditions },
        {
          orderNumber: { $not: /^TEST|^MOCK|^DEMO|^DEV_|^DUMMY_/i },
          userEmail: { $not: /@example\.com$|@test\.com$|^test@|^dummy@/i },
          isTest: { $ne: true },
          testOrder: { $ne: true },
          isMock: { $ne: true }
        },
        {
          $or: [
            // 1. All historical orders placed on or before 6 October 2026
            {
              createdAt: { $lte: cutoffDate },
              orderStatus: { $nin: ['PENDING', 'PAYMENT_PENDING'] }
            },
            // 2. From 7 October onwards: Strictly verified / completed orders only
            {
              createdAt: { $gt: cutoffDate },
              $or: [
                // Standard COD (No advance needed)
                {
                  paymentMethod: { $in: ['COD', 'cod'] },
                  $or: [
                    { upfrontAmount: { $in: [0, null] } },
                    { upfrontAmount: { $exists: false } }
                  ],
                  paymentStatus: { $in: ['COD_PENDING', 'COD', 'Pending', 'PENDING'] },
                  orderStatus: { $in: ['Placed', 'PLACED', 'Processing', 'PROCESSING', 'SHIPPED', 'Shipped', 'DELIVERED', 'Delivered'] }
                },
                // Partial COD (where advance was successfully paid)
                {
                  $or: [
                    { paymentMethod: { $in: ['COD_UPFRONT', 'PART_COD', 'cod_upfront'] } },
                    { upfrontAmount: { $gt: 0 } }
                  ],
                  $or: [
                    { paymentStatus: { $in: ['PARTIAL_PAID', 'PAID', 'COMPLETED'] } },
                    { upfrontPaymentStatus: { $in: ['Paid', 'PAID', 'Completed', 'COMPLETED'] } }
                  ]
                },
                // Online Prepaid orders (where full payment was successfully paid)
                {
                  paymentMethod: { $nin: ['COD', 'cod', 'COD_UPFRONT', 'PART_COD'] },
                  $or: [
                    { upfrontAmount: { $in: [0, null] } },
                    { upfrontAmount: { $exists: false } }
                  ],
                  paymentStatus: { $in: ['PAID', 'COMPLETED', 'Paid'] }
                }
              ],
              orderStatus: { $nin: ['PENDING', 'PAYMENT_PENDING'] },
              paymentStatus: { $nin: ['FAILED'] }
            }
          ]
        }
      ]
    };

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    console.log(`\nFiltered Orders Count for Amit Kumar: ${orders.length} (Expected: 31)\n`);

    orders.forEach((o, i) => {
      console.log(`${i + 1}. ID: ${o._id} | Date: ${new Date(o.createdAt).toLocaleString('en-IN')} | Status: ${o.orderStatus} | Payment: ${o.paymentStatus} (${o.paymentMethod}) | Total: ₹${o.total || o.amount}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

testFilter();
