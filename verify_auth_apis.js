require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = `johndoe_${Date.now()}@example.com`;

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

async function runAuthVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING ONLY THE 7 REQUESTED AUTHENTICATION APIS');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  const OtpModel = mongoose.model(
    'Otp_Temp',
    new mongoose.Schema({ email: String, otp: String }, { timestamps: true, strict: false }),
    'otps'
  );

  let jwtToken = '';

  // 1. POST /auth/register
  console.log('--------------------------------------------------------');
  console.log('1️⃣ POST /api/auth/register');
  console.log('Body:', { name: 'John Doe', email: testEmail });
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'John Doe', email: testEmail }),
  });
  console.log(`Status: ${regRes.status} | Response:`, JSON.stringify(regRes.data, null, 2));

  // 2. POST /auth/signup-verify
  const otpDoc = await OtpModel.findOne({ email: testEmail.toLowerCase() }).sort({ createdAt: -1 });
  const signupOtp = otpDoc ? otpDoc.otp : '123456';

  console.log('\n--------------------------------------------------------');
  console.log('2️⃣ POST /api/auth/signup-verify');
  console.log('Body:', { email: testEmail, otp: signupOtp });
  const verifyRes = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: signupOtp }),
  });
  console.log(`Status: ${verifyRes.status} | Response:`, JSON.stringify(verifyRes.data, null, 2));

  // 3. POST /auth/login
  console.log('\n--------------------------------------------------------');
  console.log('3️⃣ POST /api/auth/login');
  console.log('Body:', { email: testEmail });
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail }),
  });
  console.log(`Status: ${loginRes.status} | Response:`, JSON.stringify(loginRes.data, null, 2));

  // 4. POST /auth/login-verify
  const loginOtpDoc = await OtpModel.findOne({ email: testEmail.toLowerCase() }).sort({ createdAt: -1 });
  const loginOtp = loginOtpDoc ? loginOtpDoc.otp : '123456';

  console.log('\n--------------------------------------------------------');
  console.log('4️⃣ POST /api/auth/login-verify');
  console.log('Body:', { email: testEmail, otp: loginOtp });
  const loginVerifyRes = await request('/auth/login-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: loginOtp }),
  });
  if (loginVerifyRes.data?.data?.accessToken || loginVerifyRes.data?.data?.token) {
    jwtToken = loginVerifyRes.data.data.accessToken || loginVerifyRes.data.data.token;
  }
  console.log(`Status: ${loginVerifyRes.status} | Response:`, JSON.stringify(loginVerifyRes.data, null, 2));

  // 5. POST /auth/resend-otp
  console.log('\n--------------------------------------------------------');
  console.log('5️⃣ POST /api/auth/resend-otp');
  console.log('Body:', { email: testEmail, purpose: 'login' });
  const resendRes = await request('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, purpose: 'login' }),
  });
  console.log(`Status: ${resendRes.status} | Response:`, JSON.stringify(resendRes.data, null, 2));

  // 6. GET /users/profile (Protected)
  console.log('\n--------------------------------------------------------');
  console.log('6️⃣ GET /api/users/profile (Protected)');
  console.log('Headers:', { Authorization: `Bearer ${jwtToken.slice(0, 15)}...` });
  const getProfileRes = await request('/users/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  console.log(`Status: ${getProfileRes.status} | Response:`, JSON.stringify(getProfileRes.data, null, 2));

  // 7. PUT /users/profile (Protected)
  console.log('\n--------------------------------------------------------');
  console.log('7️⃣ PUT /api/users/profile (Protected)');
  console.log('Body:', { name: 'John Doe Updated', phoneNumber: '9876543210' });
  const putProfileRes = await request('/users/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${jwtToken}` },
    body: JSON.stringify({ name: 'John Doe Updated', phoneNumber: '9876543210' }),
  });
  console.log(`Status: ${putProfileRes.status} | Response:`, JSON.stringify(putProfileRes.data, null, 2));

  console.log('\n========================================================');
  console.log('🏁 AUTH APIS VERIFICATION COMPLETED');
  console.log('========================================================');

  await mongoose.disconnect();
}

runAuthVerification();
