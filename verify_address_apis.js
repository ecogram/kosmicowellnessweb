require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = `address_tester_${Date.now()}@example.com`;

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

async function runAddressVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING COMPLETE CRUD ADDRESS APIS (/api/addresses)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  // 1. Authenticate user
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Address Tester', email: testEmail }),
  });

  const Otp = mongoose.model(
    'Otp_Temp_A',
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

  console.log('🔑 Authenticated successfully with token:', jwtToken ? `${jwtToken.slice(0, 15)}...` : 'Failed');

  let createdAddressId = '';

  // STEP 1: CREATE ADDRESS (POST /api/addresses)
  console.log('\n--------------------------------------------------------');
  console.log('1️⃣ POST /api/addresses (Create User Delivery Address)');
  const newAddressPayload = {
    addressLabel: 'Home',
    fullName: 'John Doe',
    streetAddress: 'Flat 402, Green Valley Apartments',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phoneNumber: '9876543210',
    isDefault: true,
  };
  console.log('Body:', newAddressPayload);
  const createRes = await request('/addresses', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newAddressPayload),
  });
  createdAddressId = createRes.data?.data?._id || createRes.data?.data?.id;
  console.log(`Status: ${createRes.status} | Response:`, JSON.stringify(createRes.data, null, 2));

  // STEP 2: GET ALL ADDRESSES (GET /api/addresses)
  console.log('\n--------------------------------------------------------');
  console.log('2️⃣ GET /api/addresses (Get All User Delivery Addresses)');
  const listRes = await request('/addresses', {
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`Status: ${listRes.status} | Response:`, JSON.stringify(listRes.data, null, 2));

  // STEP 3: GET SINGLE ADDRESS BY ID (GET /api/addresses/:addressId)
  if (createdAddressId) {
    console.log('\n--------------------------------------------------------');
    console.log(`3️⃣ GET /api/addresses/${createdAddressId} (Get Single Address)`);
    const singleRes = await request(`/addresses/${createdAddressId}`, {
      method: 'GET',
      headers: authHeaders,
    });
    console.log(`Status: ${singleRes.status} | Response:`, JSON.stringify(singleRes.data, null, 2));

    // STEP 4: UPDATE ADDRESS (PUT /api/addresses/:addressId)
    console.log('\n--------------------------------------------------------');
    console.log(`4️⃣ PUT /api/addresses/${createdAddressId} (Update Address)`);
    const updatePayload = {
      addressLabel: 'Office',
      streetAddress: 'Plot 101, Tech Park, Andheri East',
      phoneNumber: '9123456780',
    };
    console.log('Body:', updatePayload);
    const updateRes = await request(`/addresses/${createdAddressId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updatePayload),
    });
    console.log(`Status: ${updateRes.status} | Response:`, JSON.stringify(updateRes.data, null, 2));

    // STEP 5: SET AS DEFAULT (PUT /api/addresses/set-default/:addressId)
    console.log('\n--------------------------------------------------------');
    console.log(`5️⃣ PUT /api/addresses/set-default/${createdAddressId} (Set Default Address)`);
    const defRes = await request(`/addresses/set-default/${createdAddressId}`, {
      method: 'PUT',
      headers: authHeaders,
    });
    console.log(`Status: ${defRes.status} | Response:`, JSON.stringify(defRes.data, null, 2));

    // STEP 6: DELETE ADDRESS (DELETE /api/addresses/:addressId)
    console.log('\n--------------------------------------------------------');
    console.log(`6️⃣ DELETE /api/addresses/${createdAddressId} (Delete Address)`);
    const deleteRes = await request(`/addresses/${createdAddressId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    console.log(`Status: ${deleteRes.status} | Response:`, JSON.stringify(deleteRes.data, null, 2));

    // STEP 7: VERIFY DELETION
    console.log('\n--------------------------------------------------------');
    console.log('7️⃣ GET /api/addresses (Verify address list after deletion)');
    const finalListRes = await request('/addresses', {
      method: 'GET',
      headers: authHeaders,
    });
    console.log(`Status: ${finalListRes.status} | Remaining Addresses:`, finalListRes.data?.data?.length || 0);
  }

  console.log('\n========================================================');
  console.log('🏁 ADDRESS CRUD APIS VERIFICATION COMPLETED');
  console.log('========================================================');

  await mongoose.disconnect();
}

runAddressVerification();
