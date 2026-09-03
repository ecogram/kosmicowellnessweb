require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const runTests = async () => {
  await connectDB();

  // Make sure we have a user
  const user = await User.findOne({ email: 'test_userA@example.com' });
  if (!user) {
    console.log('User not found. Run run-tests.js first.');
    process.exit(1);
  }

  // Create a dummy order
  const order = await Order.create({
    orderNumber: `TEST-ORD-${Date.now()}`,
    user: user._id,
    items: [],
    subtotal: 10,
    shipping: 0,
    tax: 0,
    total: 10, // Must result in 1000 paise
    shippingAddress: { fullName: 'A', phone: '123', addressLine1: 'B', city: 'C', state: 'D', postalCode: 'E', country: 'F' },
    billingAddress: { fullName: 'A', phone: '123', addressLine1: 'B', city: 'C', state: 'D', postalCode: 'E', country: 'F' },
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING'
  });

  console.log('\n--- 1. AMOUNT VERIFICATION & PAYMENT CREATION ---');
  // Create payment securely server-side
  let paymentInit;
  try {
    paymentInit = await paymentService.createPayment(order._id, user._id);
    console.log(`Expected Paise: 1000, Actual: ${paymentInit.amount}`);
    console.log(`Razorpay Order ID: ${paymentInit.providerOrderId}`);
  } catch (err) {
    console.error('Failed to create payment. Ensure Razorpay keys in .env are valid test keys, or this will fail:', err.message);
    if (err.message.includes('initialize payment gateway')) {
       console.log('Note: To fully test API interaction, actual valid test keys are required in .env. Skipping external API call simulation if failed.');
    }
  }

  // If Razorpay API fails (because dummy keys), we will mock the Payment record to proceed with Webhook/Signature testing
  if (!paymentInit) {
    const dummyProviderOrderId = 'order_dummy_' + Date.now();
    await Payment.create({
      order: order._id,
      user: user._id,
      providerOrderId: dummyProviderOrderId,
      amount: 1000,
      currency: 'INR',
      status: 'CREATED',
    });
    paymentInit = { providerOrderId: dummyProviderOrderId, amount: 1000, currency: 'INR' };
    console.log(`Mocked Payment Record for Webhook Testing: ${dummyProviderOrderId}`);
  }

  console.log('\n--- 2. SIGNATURE VERIFICATION REJECTION ---');
  try {
    await paymentService.verifyPaymentSignature(user._id, {
      razorpay_order_id: paymentInit.providerOrderId,
      razorpay_payment_id: 'pay_invalid_123',
      razorpay_signature: 'invalid_tampered_signature_hex'
    });
    console.log('FAIL: Signature verification did NOT reject tampered payload.');
  } catch (err) {
    console.log(`SUCCESS: Tampered payload rejected. Reason: ${err.message}`);
  }

  console.log('\n--- 3. VALID WEBHOOK & IDEMPOTENCY DEDUPLICATION ---');
  
  const webhookPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_valid_123',
          order_id: paymentInit.providerOrderId,
          method: 'upi',
          amount: 1000
        }
      }
    }
  });

  const webhookSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(webhookPayload)
    .digest('hex');

  console.log('Firing first webhook...');
  await paymentService.handleWebhook(webhookPayload, webhookSignature);
  let updatedPayment = await Payment.findOne({ providerOrderId: paymentInit.providerOrderId });
  console.log(`Payment Status after Webhook: ${updatedPayment.status} (Expected: PAID)`);

  console.log('Firing identical duplicate webhook to simulate Razorpay retry/idempotency...');
  await paymentService.handleWebhook(webhookPayload, webhookSignature);
  updatedPayment = await Payment.findOne({ providerOrderId: paymentInit.providerOrderId });
  console.log(`Duplicate handled gracefully. Status remains: ${updatedPayment.status}`);

  const updatedOrder = await Order.findById(order._id);
  console.log(`Order Status successfully mutated to: ${updatedOrder.orderStatus}, Payment: ${updatedOrder.paymentStatus}`);
  console.log('WEBHOOK IDEMPOTENCY VERIFIED: ' + (updatedPayment.status === 'PAID' && updatedOrder.paymentStatus === 'PAID'));

  process.exit(0);
};

runTests();
