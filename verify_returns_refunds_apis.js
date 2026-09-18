require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://127.0.0.1:5000/api';
const testEmail = `return_refund_tester_${Date.now()}@example.com`;

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

async function runReturnsRefundsVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING RETURNS & REFUNDS APIS (/api/return, /api/refund)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  // 1. Authenticate user
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Return Tester', email: testEmail }),
  });
  if (!regRes.ok) console.log('Register failed:', regRes);

  const Otp = mongoose.model(
    'Otp_Temp_RR',
    new mongoose.Schema({ email: String, otp: String }, { strict: false }),
    'otps'
  );
  const otpDoc = await Otp.findOne({ email: testEmail.toLowerCase() }).sort({ createdAt: -1 });
  const otp = otpDoc ? otpDoc.otp : '123456';

  const authRes = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp }),
  });
  if (!authRes.ok) console.log('Auth failed:', authRes);
  const jwtToken = authRes.data?.data?.accessToken || authRes.data?.data?.token;
  const authHeaders = { Authorization: `Bearer ${jwtToken}` };

  console.log('🔑 Authenticated with token:', jwtToken ? `${jwtToken.slice(0, 15)}...` : 'Failed');

  // 2. Create sample address & sample order for this user
  const addrRes = await request('/addresses', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fullName: 'Return Tester',
      streetAddress: '123 Test Street',
      city: 'Delhi',
      pincode: '110001',
      phoneNumber: '9876543210',
    }),
  });
  const addressId = addrRes.data?.data?._id;

  const Product = mongoose.model(
    'Product_Temp_RR',
    new mongoose.Schema({ name: String, price: Number }, { strict: false }),
    'products'
  );
  const sampleProduct = await Product.findOne();
  const sampleProductId = sampleProduct ? sampleProduct._id.toString() : '6a5dc8bd878ae5943bebf6b4';

  const orderRes = await request('/payment/cod', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 649,
      deliveryAddressId: addressId,
      items: [{ productId: sampleProductId, quantity: 1, price: 649 }],
    }),
  });
  const sampleOrderId = orderRes.data?.data?.order?._id || orderRes.data?.data?._id;
  const sampleOrderNumber = orderRes.data?.data?.order?.orderNumber || orderRes.data?.data?.orderNumber;

  console.log('📦 Created Test Order ID:', sampleOrderId, '| Order Number:', sampleOrderNumber);

  // STEP 1: POST /api/return/request (Request Return)
  console.log('\n--------------------------------------------------------');
  console.log('1️⃣ POST /api/return/request (Request a Return for an Order)');
  const returnPayload = {
    orderId: sampleOrderId,
    reason: 'Product was damaged',
  };
  console.log('Body:', returnPayload);
  const returnRes = await request('/return/request', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(returnPayload),
  });
  console.log(`Status: ${returnRes.status} | Response:`, JSON.stringify(returnRes.data, null, 2));

  // STEP 2: POST /api/refund/request (Request Refund)
  console.log('\n--------------------------------------------------------');
  console.log('2️⃣ POST /api/refund/request (Request a Refund for an Order)');
  const refundPayload = {
    orderId: sampleOrderId,
    reason: 'Did not like the product',
  };
  console.log('Body:', refundPayload);
  const refundRes = await request('/refund/request', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(refundPayload),
  });
  console.log(`Status: ${refundRes.status} | Response:`, JSON.stringify(refundRes.data, null, 2));

  console.log('\n========================================================');
  console.log('🏁 RETURNS & REFUNDS APIS VERIFICATION COMPLETED');
  console.log('========================================================');

  await mongoose.disconnect();
}

runReturnsRefundsVerification();
