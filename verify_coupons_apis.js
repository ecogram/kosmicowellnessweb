require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://127.0.0.1:5000/api';

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

async function runCouponsVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING COUPONS APIS (/api/coupons)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  const Coupon = mongoose.model(
    'Coupon_Temp',
    new mongoose.Schema(
      {
        code: String,
        description: String,
        discountType: String,
        discountValue: Number,
        minOrderAmount: Number,
        isActive: Boolean,
      },
      { strict: false }
    ),
    'coupons'
  );

  // Ensure test coupon "WELCOME10" exists in DB
  await Coupon.findOneAndUpdate(
    { code: 'WELCOME10' },
    {
      code: 'WELCOME10',
      description: 'Welcome 10% Discount',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 100,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true }
  );

  let passed = 0;
  let failed = 0;

  // 1. GET /coupons (List active coupons)
  console.log('1️⃣ Testing GET /api/coupons (List all active coupons)...');
  const getRes = await request('/coupons');
  if (getRes.status === 200 && getRes.data?.success && Array.isArray(getRes.data.data)) {
    console.log(`   ✅ PASS: GET /api/coupons succeeded. Found ${getRes.data.data.length} coupon(s).`);
    passed++;
  } else {
    console.log('   ❌ FAIL: GET /api/coupons failed', getRes);
    failed++;
  }

  // 2. POST /coupons/verify (Verify valid coupon)
  console.log('\n2️⃣ Testing POST /api/coupons/verify with valid coupon...');
  const verifyPayload = {
    code: 'WELCOME10',
    orderAmount: 1500,
  };
  console.log('   Request Body:', verifyPayload);
  const verifyRes = await request('/coupons/verify', {
    method: 'POST',
    body: JSON.stringify(verifyPayload),
  });

  if (
    verifyRes.status === 200 &&
    verifyRes.data?.success &&
    verifyRes.data.data?.code === 'WELCOME10' &&
    verifyRes.data.data?.discountAmount === 150 &&
    verifyRes.data.data?.finalAmount === 1350
  ) {
    console.log('   ✅ PASS: POST /api/coupons/verify calculated discount correctly');
    console.log(`      Discount: ₹${verifyRes.data.data.discountAmount}, Final Amount: ₹${verifyRes.data.data.finalAmount}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: POST /api/coupons/verify failed', verifyRes);
    failed++;
  }

  // 3. POST /coupons/verify (Invalid coupon code)
  console.log('\n3️⃣ Testing POST /api/coupons/verify with invalid coupon code...');
  const invalidRes = await request('/coupons/verify', {
    method: 'POST',
    body: JSON.stringify({ code: 'INVALID_CODE_999', orderAmount: 1500 }),
  });

  if (invalidRes.status === 404 && !invalidRes.data?.success) {
    console.log(`   ✅ PASS: Correctly rejected invalid coupon (Status ${invalidRes.status}: ${invalidRes.data?.message})`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Should have returned 404 for invalid coupon', invalidRes);
    failed++;
  }

  console.log('\n========================================================');
  console.log(`🏁 RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');

  await mongoose.disconnect();
}

runCouponsVerification();
