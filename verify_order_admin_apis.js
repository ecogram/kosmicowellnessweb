require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://127.0.0.1:5000/api';
const testEmail = `order_admin_tester_${Date.now()}@example.com`;

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

async function runOrderAdminVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING ORDER & RETURNS MANAGEMENT APIS (ADMIN SIDE)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  // 1. Create user and sample order
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Order Admin Tester', email: testEmail }),
  });

  const Otp = mongoose.model(
    'Otp_Temp_OA',
    new mongoose.Schema({ email: String, otp: String }, { strict: false }),
    'otps'
  );
  const otpDoc = await Otp.findOne({ email: testEmail.toLowerCase() }).sort({ createdAt: -1 });
  const authRes = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: otpDoc ? otpDoc.otp : '123456' }),
  });
  const jwtToken = authRes.data?.data?.accessToken || authRes.data?.data?.token;
  const authHeaders = { Authorization: `Bearer ${jwtToken}` };

  const addrRes = await request('/addresses', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fullName: 'Order Admin Tester',
      streetAddress: '456 Admin Road',
      city: 'Delhi',
      pincode: '110001',
      phoneNumber: '9876543210',
    }),
  });
  const addressId = addrRes.data?.data?._id;

  const orderRes = await request('/payment/cod', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 999,
      deliveryAddressId: addressId,
      items: [{ productId: '6a5dc8bd878ae5943bebf6b4', quantity: 1, price: 999 }],
    }),
  });
  const orderId = orderRes.data?.data?.order?._id;
  const orderNumber = orderRes.data?.data?.order?.orderNumber;

  console.log('📦 Sample Order Created ID:', orderId, '| Order Number:', orderNumber);

  // 1. PUT /admin/orders/:id/status
  console.log('\n--------------------------------------------------------');
  console.log(`1️⃣ PUT /api/admin/orders/${orderId}/status (Update order delivery status)`);
  const orderStatusPayload = { status: 'Shipped', paymentStatus: 'Paid' };
  console.log('Body:', orderStatusPayload);
  const orderStatusRes = await request(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(orderStatusPayload),
  });
  console.log(`Status: ${orderStatusRes.status} | Response:`, JSON.stringify(orderStatusRes.data, null, 2));

  // 2. PUT /admin/return/:id/status
  console.log('\n--------------------------------------------------------');
  console.log(`2️⃣ PUT /api/admin/return/${orderId}/status (Update status of return)`);
  const returnStatusPayload = { status: 'Approved', adminComment: 'Pickup arranged' };
  console.log('Body:', returnStatusPayload);
  const returnStatusRes = await request(`/admin/return/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(returnStatusPayload),
  });
  console.log(`Status: ${returnStatusRes.status} | Response:`, JSON.stringify(returnStatusRes.data, null, 2));

  // 3. PUT /admin/refund/:id/status
  console.log('\n--------------------------------------------------------');
  console.log(`3️⃣ PUT /api/admin/refund/${orderId}/status (Update status of refund)`);
  const refundStatusPayload = {
    status: 'Approved',
    adminComment: 'Processed',
    refundTransactionId: 'txn_123',
  };
  console.log('Body:', refundStatusPayload);
  const refundStatusRes = await request(`/admin/refund/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(refundStatusPayload),
  });
  console.log(`Status: ${refundStatusRes.status} | Response:`, JSON.stringify(refundStatusRes.data, null, 2));

  console.log('\n========================================================');
  console.log('🏁 ORDER & RETURNS MANAGEMENT APIS VERIFICATION COMPLETED');
  console.log('========================================================');

  await mongoose.disconnect();
}

runOrderAdminVerification();
