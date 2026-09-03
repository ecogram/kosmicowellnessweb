require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const IdempotencyRecord = require('../models/IdempotencyRecord');
const orderService = require('../services/orderService');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const runTests = async () => {
  await connectDB();
  
  const testUserA = await User.findOne({ email: 'test_userA@example.com' }) || await User.create({ name: 'User A', email: 'test_userA@example.com', passwordHash: 'dummy123' });
  const testUserB = await User.findOne({ email: 'test_userB@example.com' }) || await User.create({ name: 'User B', email: 'test_userB@example.com', passwordHash: 'dummy123' });

  const product = await Product.create({
    name: 'Test Product',
    slug: 'test-product-' + Date.now(),
    description: 'A test product for concurrency',
    price: 10,
    stock: 1, // Only 1 in stock
    isActive: true,
    category: new mongoose.Types.ObjectId(),
  });

  // Ensure carts exist
  await Cart.updateOne({ user: testUserA._id }, { items: [{ product: product._id, quantity: 1 }] }, { upsert: true });
  await Cart.updateOne({ user: testUserB._id }, { items: [{ product: product._id, quantity: 1 }] }, { upsert: true });

  const dummyAddress = { fullName: 'A', phone: '123', addressLine1: 'B', city: 'C', state: 'D', postalCode: 'E', country: 'F' };

  console.log('\n--- 1. CONCURRENT INVENTORY TEST ---');
  console.log('Stock initialized to 1. Firing two concurrent checkout requests (User A vs User B).');
  
  let successCount = 0;
  let failCount = 0;

  // We must ensure the requests hit `orderService` directly for accurate local simulation
  const reqA = orderService.createOrder(testUserA._id, dummyAddress, dummyAddress, 'KEY-A-' + Date.now());
  const reqB = orderService.createOrder(testUserB._id, dummyAddress, dummyAddress, 'KEY-B-' + Date.now());

  const results = await Promise.allSettled([reqA, reqB]);
  
  results.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      console.log(`Request ${index === 0 ? 'A' : 'B'} -> SUCCESS`);
      successCount++;
    } else {
      console.log(`Request ${index === 0 ? 'A' : 'B'} -> FAIL: ${res.reason.message}`);
      failCount++;
    }
  });

  const finalProduct = await Product.findById(product._id);
  console.log(`Final stock: ${finalProduct.stock}`);
  console.log(`Expected successful orders: 1 (Actual: ${successCount})`);
  console.log(`Expected failed orders: 1 (Actual: ${failCount})`);
  console.log('CONCURRENT STOCK TEST VERIFIED: ' + (finalProduct.stock === 0 && successCount === 1));

  console.log('\n--- 2. IDEMPOTENCY / DUPLICATE REQUEST TEST ---');
  // Top up product stock
  await Product.findByIdAndUpdate(product._id, { stock: 10 });
  await Cart.updateOne({ user: testUserA._id }, { items: [{ product: product._id, quantity: 1 }] });
  
  const sharedKey = 'IDEMP-TEST-' + Date.now();
  console.log(`Firing duplicate requests for User A with same key: ${sharedKey}`);

  const dup1 = orderService.createOrder(testUserA._id, dummyAddress, dummyAddress, sharedKey);
  const dup2 = orderService.createOrder(testUserA._id, dummyAddress, dummyAddress, sharedKey);

  const dupResults = await Promise.allSettled([dup1, dup2]);
  
  let successfulOrders = 0;
  let returnedOrders = new Set();
  
  dupResults.forEach((res, i) => {
    if (res.status === 'fulfilled') {
      console.log(`Duplicate Req ${i+1} -> SUCCESS (Order: ${res.value.orderNumber})`);
      returnedOrders.add(res.value.orderNumber);
      successfulOrders++;
    } else {
      console.log(`Duplicate Req ${i+1} -> 409 CONFLICT: ${res.reason.message}`);
    }
  });

  // Verify DB
  const ordersInDb = await Order.find({ user: testUserA._id }).sort('-createdAt').limit(2);
  // We only care if one specific order was created for this key. We can check IdempotencyRecord
  const idempRecs = await IdempotencyRecord.find({ idempotencyKey: sharedKey });
  console.log(`Idempotency records in DB for key: ${idempRecs.length}`);
  console.log(`Returned unique orders: ${returnedOrders.size}`);
  
  console.log('IDEMPOTENCY VERIFIED: ' + (idempRecs.length === 1 && (successfulOrders === 1 || returnedOrders.size === 1)));

  console.log('\n--- 3. DIFFERENT USER TEST ---');
  await Cart.updateOne({ user: testUserA._id }, { items: [{ product: product._id, quantity: 1 }] });
  await Cart.updateOne({ user: testUserB._id }, { items: [{ product: product._id, quantity: 1 }] });

  const diffUserKey = 'SHARED-KEY-' + Date.now();
  console.log(`Firing requests for User A and User B using SAME key: ${diffUserKey}`);

  const diffA = await orderService.createOrder(testUserA._id, dummyAddress, dummyAddress, diffUserKey);
  const diffB = await orderService.createOrder(testUserB._id, dummyAddress, dummyAddress, diffUserKey);

  console.log(`User A Order: ${diffA.orderNumber}`);
  console.log(`User B Order: ${diffB.orderNumber}`);
  console.log('DIFFERENT USER VERIFIED: ' + (diffA.orderNumber !== diffB.orderNumber));

  console.log('\n--- 4. RETRY TEST (Rollback Behavior) ---');
  // Deliberately cause a failure for User A (empty cart, but key sent)
  await Cart.updateOne({ user: testUserA._id }, { items: [] });
  const retryKey = 'RETRY-KEY-' + Date.now();
  
  try {
    console.log('Firing failing request...');
    await orderService.createOrder(testUserA._id, dummyAddress, dummyAddress, retryKey);
  } catch (err) {
    console.log(`Failed correctly: ${err.message}`);
  }

  // Refill cart and retry with exact SAME key
  await Cart.updateOne({ user: testUserA._id }, { items: [{ product: product._id, quantity: 1 }] });
  
  console.log(`Retrying with SAME key: ${retryKey}`);
  const retrySuccess = await orderService.createOrder(testUserA._id, dummyAddress, dummyAddress, retryKey);
  console.log(`Retry SUCCESS (Order: ${retrySuccess.orderNumber})`);
  
  const retryRecs = await IdempotencyRecord.find({ idempotencyKey: retryKey });
  console.log('RETRY VERIFIED: ' + (retryRecs.length === 1));

  // Cleanup
  process.exit(0);
};

runTests();
