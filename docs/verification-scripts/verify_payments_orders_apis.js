require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = `pay_tester_${Date.now()}@example.com`;
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET || '8HiA1PomM2gcACR54tAfnagQ';

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
};

async function runPaymentVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING PAYMENTS, ORDERS & CART APIS (/api/payment)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  const Product = mongoose.model(
    'Product_Temp_Pay',
    new mongoose.Schema({ name: String, price: Number }, { strict: false }),
    'products'
  );
  const sampleProduct = await Product.findOne();
  const sampleProductId = sampleProduct ? sampleProduct._id.toString() : new mongoose.Types.ObjectId().toString();

  // 1. Register & Login to get real JWT Token
  console.log('Authenticating Test User...');
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Payment User', email: testEmail }),
  });

  const Otp = mongoose.model(
    'Otp_Temp_Pay',
    new mongoose.Schema({ email: String, otp: String }, { strict: false }),
    'otps'
  );
  const otpDoc = await Otp.findOne({ email: testEmail.toLowerCase() }).sort({ createdAt: -1 });
  const otp = otpDoc ? otpDoc.otp : '123456';

  const authRes = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp }),
  });
  const jwtToken = authRes.data?.data?.accessToken || authRes.data?.data?.token;
  const authHeaders = { Authorization: `Bearer ${jwtToken}` };

  let passed = 0;
  let failed = 0;

  // 1. POST /payment/razorpay/create
  console.log('\n1. Testing POST /payment/razorpay/create (Protected)...');
  const razorpayCreateRes = await request('/payment/razorpay/create', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 999,
      deliveryAddressId: new mongoose.Types.ObjectId().toString(),
      items: [
        {
          product: sampleProductId,
          name: 'Vitamin C Serum',
          qty: 2,
          price: 499,
        },
      ],
      couponCode: 'WELCOME10',
      discountAmount: 100,
      deliveryFee: 50,
    }),
  });

  let razorpayOrderId = null;
  if (razorpayCreateRes.status === 200 && razorpayCreateRes.data?.success) {
    razorpayOrderId = razorpayCreateRes.data.data.orderId || razorpayCreateRes.data.data.providerOrderId;
    console.log('   ✅ PASS: POST /payment/razorpay/create created Razorpay order');
    console.log(`      Order ID: ${razorpayOrderId}, Order Number: ${razorpayCreateRes.data.data.orderNumber}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: POST /payment/razorpay/create failed', razorpayCreateRes);
    failed++;
  }

  // 2. POST /payment/razorpay/verify
  console.log('\n2. Testing POST /payment/razorpay/verify (Protected)...');
  const testPaymentId = `pay_${Date.now()}`;
  const validSignature = crypto
    .createHmac('sha256', RZP_SECRET)
    .update(`${razorpayOrderId}|${testPaymentId}`)
    .digest('hex');

  const razorpayVerifyRes = await request('/payment/razorpay/verify', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
    }),
  });

  if (razorpayVerifyRes.status === 200 && razorpayVerifyRes.data?.success) {
    console.log('   ✅ PASS: POST /payment/razorpay/verify verified payment successfully');
    console.log(`      Status: ${razorpayVerifyRes.data.data.payment.status}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: POST /payment/razorpay/verify failed', razorpayVerifyRes);
    failed++;
  }

  // 3. POST /payment/cod
  console.log('\n3. Testing POST /payment/cod (Protected)...');
  const codRes = await request('/payment/cod', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 899,
      deliveryAddressId: new mongoose.Types.ObjectId().toString(),
      items: [
        {
          product: sampleProductId,
          name: 'Vitamin C Serum',
          qty: 1,
          price: 899,
        },
      ],
      couponCode: 'WELCOME10',
      discountAmount: 100,
      deliveryFee: 50,
    }),
  });

  if (codRes.status === 201 && codRes.data?.success && codRes.data.data?.order) {
    console.log('   ✅ PASS: POST /payment/cod placed Cash on Delivery order successfully');
    console.log(`      Order Number: ${codRes.data.data.order.orderNumber}, Total: ${codRes.data.data.order.total}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: POST /payment/cod failed', codRes);
    failed++;
  }

  // 4. POST /payment/cod-upfront/create
  console.log('\n4. Testing POST /payment/cod-upfront/create (Protected)...');
  const codUpfrontCreateRes = await request('/payment/cod-upfront/create', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 1500,
      upfrontAmount: 150,
      deliveryAddressId: new mongoose.Types.ObjectId().toString(),
      items: [
        {
          product: sampleProductId,
          name: 'Vitamin C Serum',
          qty: 2,
          price: 750,
        },
      ],
    }),
  });

  let upfrontOrderId = null;
  if (codUpfrontCreateRes.status === 200 && codUpfrontCreateRes.data?.success && codUpfrontCreateRes.data.data?.upfrontAmount === 150) {
    upfrontOrderId = codUpfrontCreateRes.data.data.orderId || codUpfrontCreateRes.data.data.providerOrderId;
    console.log('   ✅ PASS: POST /payment/cod-upfront/create initialized upfront payment order');
    console.log(`      Order ID: ${upfrontOrderId}, Upfront Amount: ${codUpfrontCreateRes.data.data.upfrontAmount}, Remaining COD: ${codUpfrontCreateRes.data.data.remainingCodAmount}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: POST /payment/cod-upfront/create failed', codUpfrontCreateRes);
    failed++;
  }

  // 5. POST /payment/cod-upfront/verify
  console.log('\n5. Testing POST /payment/cod-upfront/verify (Protected)...');
  const testUpfrontPaymentId = `pay_upfront_${Date.now()}`;
  const validUpfrontSig = crypto
    .createHmac('sha256', RZP_SECRET)
    .update(`${upfrontOrderId}|${testUpfrontPaymentId}`)
    .digest('hex');

  const codUpfrontVerifyRes = await request('/payment/cod-upfront/verify', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      razorpay_order_id: upfrontOrderId,
      razorpay_payment_id: testUpfrontPaymentId,
      razorpay_signature: validUpfrontSig,
    }),
  });

  if (codUpfrontVerifyRes.status === 200 && codUpfrontVerifyRes.data?.success) {
    console.log('   ✅ PASS: POST /payment/cod-upfront/verify verified upfront payment successfully');
    console.log(`      Status: ${codUpfrontVerifyRes.data.data.payment.status}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: POST /payment/cod-upfront/verify failed', codUpfrontVerifyRes);
    failed++;
  }

  // 6. GET /payments/myorders
  console.log('\n6. Testing GET /payments/myorders (Protected)...');
  const myOrdersRes = await request('/payments/myorders', {
    method: 'GET',
    headers: authHeaders,
  });

  if (myOrdersRes.status === 200 && myOrdersRes.data?.success && Array.isArray(myOrdersRes.data.data.orders)) {
    console.log('   ✅ PASS: GET /payments/myorders retrieved user orders list');
    console.log(`      Found ${myOrdersRes.data.data.orders.length} order(s) for the current user.`);
    passed++;
  } else {
    console.log('   ❌ FAIL: GET /payments/myorders failed', myOrdersRes);
    failed++;
  }

  // 6b. GET /payment/myorders (singular alias)
  console.log('\n6b. Testing GET /payment/myorders (Protected)...');
  const myOrdersSingularRes = await request('/payment/myorders', {
    method: 'GET',
    headers: authHeaders,
  });

  if (myOrdersSingularRes.status === 200 && myOrdersSingularRes.data?.success && Array.isArray(myOrdersSingularRes.data.data.orders)) {
    console.log('   ✅ PASS: GET /payment/myorders retrieved user orders list');
    passed++;
  } else {
    console.log('   ❌ FAIL: GET /payment/myorders failed', myOrdersSingularRes);
    failed++;
  }

  // Cleanup test user and test orders
  const User = mongoose.model(
    'User_Temp_Pay',
    new mongoose.Schema({ email: String }, { strict: false }),
    'users'
  );
  await User.deleteOne({ email: testEmail });
  await Otp.deleteMany({ email: testEmail });
  await mongoose.disconnect();

  console.log('\n========================================================');
  console.log(`🏁 RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');
}

runPaymentVerification();
