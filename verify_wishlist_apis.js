require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = `wishlist_tester_${Date.now()}@example.com`;

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

async function runWishlistVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING WISHLIST APIS ONE-BY-ONE (/api/wishlist)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  const Product = mongoose.model(
    'Product_Temp',
    new mongoose.Schema({ name: String, price: Number }, { strict: false }),
    'products'
  );
  const sampleProduct = await Product.findOne();
  const sampleProductId = sampleProduct ? sampleProduct._id.toString() : '60d5ec49c1234567890abcde';

  // 1. Register & Login to get JWT Token
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Wishlist User', email: testEmail }),
  });

  const Otp = mongoose.model(
    'Otp_Temp_W',
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

  console.log('🔑 Authenticated with token:', jwtToken ? `${jwtToken.slice(0, 15)}...` : 'Failed');

  // STEP 1: GET /api/wishlist/ (Initial empty wishlist)
  console.log('\n--------------------------------------------------------');
  console.log('1️⃣ GET /api/wishlist/ (Get user\'s wishlist)');
  console.log('Headers: Authorization: Bearer <token>');
  const getRes1 = await request('/wishlist', {
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`Status: ${getRes1.status} | Response:`, JSON.stringify(getRes1.data, null, 2));

  // STEP 2: POST /api/wishlist/add (Add product to wishlist)
  console.log('\n--------------------------------------------------------');
  console.log('2️⃣ POST /api/wishlist/add (Add product to wishlist)');
  console.log('Body:', { productId: sampleProductId });
  const addRes = await request('/wishlist/add', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: sampleProductId }),
  });
  console.log(`Status: ${addRes.status} | Response:`, JSON.stringify(addRes.data, null, 2));

  // STEP 3: DELETE /api/wishlist/remove (Remove product from wishlist)
  console.log('\n--------------------------------------------------------');
  console.log('3️⃣ DELETE /api/wishlist/remove (Remove product from wishlist)');
  console.log('Body:', { productId: sampleProductId });
  const delRes = await request('/wishlist/remove', {
    method: 'DELETE',
    headers: authHeaders,
    body: JSON.stringify({ productId: sampleProductId }),
  });
  console.log(`Status: ${delRes.status} | Response:`, JSON.stringify(delRes.data, null, 2));

  // STEP 4: Verify Wishlist is empty again
  console.log('\n--------------------------------------------------------');
  console.log('4️⃣ GET /api/wishlist/ (Verify wishlist after removal)');
  const getRes2 = await request('/wishlist', {
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`Status: ${getRes2.status} | Items in Wishlist:`, getRes2.data?.data?.wishlist?.items?.length || 0);

  console.log('\n========================================================');
  console.log('🏁 WISHLIST APIS VERIFICATION COMPLETED');
  console.log('========================================================');

  await mongoose.disconnect();
}

runWishlistVerification();
