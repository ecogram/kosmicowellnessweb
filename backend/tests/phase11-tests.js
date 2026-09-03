require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const reviewService = require('../services/reviewService');
const notificationService = require('../services/notificationService');
const paymentService = require('../services/paymentService');
const crypto = require('crypto');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const runTests = async () => {
  await connectDB();

  const userA = await User.findOne({ email: 'test_userA@example.com' });
  if (!userA) {
    console.log('User not found. Ensure previous seeds are run.');
    process.exit(1);
  }

  const product = await Product.findOne();
  if (!product) {
    console.log('Product not found.');
    process.exit(1);
  }

  // Ensure user has a valid DELIVERED order for this product
  let order = await Order.findOne({ user: userA._id, 'items.product': product._id });
  if (!order) {
    order = await Order.create({
      orderNumber: `TEST-ORD-${Date.now()}`,
      user: userA._id,
      items: [{ product: product._id, name: product.name, quantity: 1, priceSnapshot: 10 }],
      subtotal: 10,
      shipping: 0,
      tax: 0,
      total: 10,
      shippingAddress: { fullName: 'A', phone: '123', addressLine1: 'B', city: 'C', state: 'D', postalCode: 'E', country: 'F' },
      billingAddress: { fullName: 'A', phone: '123', addressLine1: 'B', city: 'C', state: 'D', postalCode: 'E', country: 'F' },
      orderStatus: 'DELIVERED',
      paymentStatus: 'PAID'
    });
  } else {
    order.orderStatus = 'DELIVERED';
    await order.save();
  }

  console.log('\n--- 1. VERIFIED PURCHASE CHECK ---');
  const isVerified = await reviewService.checkVerifiedPurchase(userA._id, product._id);
  console.log(`User eligible for verified purchase: ${isVerified} (Expected: true)`);

  // Clean old reviews
  await Review.deleteMany({ product: product._id, user: userA._id });

  console.log('\n--- 2. REVIEW CREATION ---');
  const review = await reviewService.createReview(product._id, userA._id, 5, 'Great!', 'I loved it.');
  console.log(`Review created with verified status: ${review.isVerifiedPurchase}`);

  console.log('\n--- 3. DUPLICATE REVIEW PREVENTION ---');
  try {
    await reviewService.createReview(product._id, userA._id, 4, 'Again!', 'Testing duplicate');
    console.log('FAIL: Duplicate review was allowed.');
  } catch (err) {
    console.log(`SUCCESS: Duplicate caught: ${err.message}`);
  }

  console.log('\n--- 4. NOTIFICATION CREATION & DEDUPLICATION ---');
  // First clear old notifications for clean slate
  await Notification.deleteMany({ user: userA._id, type: 'ORDER_DELIVERED', 'data.orderId': order._id });

  await notificationService.createOrderNotification(userA._id, order._id, order.orderNumber, 'DELIVERED');
  let notifs = await Notification.find({ user: userA._id, type: 'ORDER_DELIVERED', 'data.orderId': order._id });
  console.log(`Order Delivered Notifications Count: ${notifs.length} (Expected: 1)`);

  // Try duplicate
  await notificationService.createOrderNotification(userA._id, order._id, order.orderNumber, 'DELIVERED');
  notifs = await Notification.find({ user: userA._id, type: 'ORDER_DELIVERED', 'data.orderId': order._id });
  console.log(`Order Delivered Notifications Count after retry: ${notifs.length} (Expected: 1)`);

  console.log('\n--- 5. HELPFUL VOTE DEDUPLICATION ---');
  await reviewService.toggleHelpful(review._id, userA._id);
  let updatedReview = await Review.findById(review._id);
  console.log(`Helpful Count after vote: ${updatedReview.helpfulCount} (Expected: 1)`);
  
  await reviewService.toggleHelpful(review._id, userA._id);
  updatedReview = await Review.findById(review._id);
  console.log(`Helpful Count after un-vote (toggle): ${updatedReview.helpfulCount} (Expected: 0)`);

  process.exit(0);
};

runTests();
