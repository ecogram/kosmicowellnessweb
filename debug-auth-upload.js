/**
 * Full authenticated profile picture test against live production server
 * Run: node debug-auth-upload.js <your-otp>
 * First run without OTP to trigger email, then run again with OTP
 */
const https = require('https');

const TEST_EMAIL = process.env.TEST_EMAIL || 'eco124977@gmail.com'; // apna registered email dalo ya TEST_EMAIL=x@y.com node debug-auth-upload.js
const OTP = process.argv[2]; // node debug-auth-upload.js 123456

function request(method, path, token, body, contentType) {
  return new Promise((resolve) => {
    const isBuffer = Buffer.isBuffer(body);
    const bodyBuf = isBuffer ? body : (body ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)) : null);
    const opts = {
      hostname: 'api.kosmicowellness.com',
      path,
      method,
      headers: {
        'Accept': 'application/json',
        ...(contentType ? { 'Content-Type': contentType } : { 'Content-Type': 'application/json' }),
        ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

async function main() {
  if (!OTP) {
    // Step 1: Send OTP
    console.log(`Sending OTP to ${TEST_EMAIL}...`);
    const r = await request('POST', '/api/auth/login', null, { email: TEST_EMAIL });
    console.log('OTP Response:', r.status, JSON.stringify(r.body).slice(0, 200));
    console.log('\nAb email check karo aur OTP ke saath dobara run karo:');
    console.log('  node debug-auth-upload.js <OTP_HERE>');
    return;
  }

  // Step 2: Verify OTP and get token
  console.log('Verifying OTP...');
  const verifyRes = await request('POST', '/api/auth/login-verify', null, { email: TEST_EMAIL, otp: OTP });
  console.log('Login:', verifyRes.status, JSON.stringify(verifyRes.body).slice(0, 300));

  const token = verifyRes.body?.data?.accessToken || verifyRes.body?.data?.token || verifyRes.body?.accessToken || verifyRes.body?.token;
  if (!token) {
    console.error('Token nahi mila. Response:', JSON.stringify(verifyRes.body));
    return;
  }
  console.log('\nToken mila ✅:', token.slice(0, 40) + '...');

  // Step 3: GET profile — see current state
  const profile = await request('GET', '/api/auth/profile', token);
  console.log('\n--- Current Profile ---');
  const u = profile.body?.data?.user || profile.body?.data || {};
  console.log('  name:', u.name);
  console.log('  profilePicture:', u.profilePicture || '(empty)');
  console.log('  profileImage:', u.profileImage || '(empty)');
  console.log('  avatar:', u.avatar || '(empty)');

  // Step 4: Try PUT /api/auth/profile-picture with multipart
  console.log('\n--- Testing PUT /api/auth/profile-picture ---');
  const boundary = '----TestBoundary12345';
  const dummyJpg = Buffer.from(
    'ffd8ffe000104a46494600010101004800480000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffda0008010100003f00d2cf20ffd9',
    'hex'
  );
  const header = Buffer.from(
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="profilePicture"; filename="test.jpg"\r\n' +
    'Content-Type: image/jpeg\r\n\r\n'
  );
  const footer = Buffer.from('\r\n--' + boundary + '--\r\n');
  const payload = Buffer.concat([header, dummyJpg, footer]);

  const uploadRes = await request(
    'PUT',
    '/api/auth/profile-picture',
    token,
    payload,
    'multipart/form-data; boundary=' + boundary
  );
  console.log('Upload Status:', uploadRes.status);
  console.log('Upload Response:', JSON.stringify(uploadRes.body).slice(0, 400));

  // Step 5: GET profile again — check if picture URL changed
  const profile2 = await request('GET', '/api/auth/profile', token);
  const u2 = profile2.body?.data?.user || profile2.body?.data || {};
  console.log('\n--- Profile After Upload ---');
  console.log('  profilePicture:', u2.profilePicture || '(empty)');
  console.log('  profileImage:', u2.profileImage || '(empty)');

  // Step 6: Test text-only update (name change) — does it erase picture?
  console.log('\n--- Testing PUT /api/auth/profile (text only — should NOT erase picture) ---');
  const textUpdate = await request('PUT', '/api/auth/profile', token, { name: u2.name || 'Test User' });
  console.log('Text Update Status:', textUpdate.status);

  const profile3 = await request('GET', '/api/auth/profile', token);
  const u3 = profile3.body?.data?.user || profile3.body?.data || {};
  console.log('\n--- Profile After Text Update ---');
  console.log('  profilePicture:', u3.profilePicture || '(ERASED ❌)');

  if (!u3.profilePicture) {
    console.log('\n🔴 BUG CONFIRMED: Text update is erasing the profile picture on LIVE server');
    console.log('   EC2 server has OLD code — git pull + pm2 restart needed!');
  } else {
    console.log('\n✅ Picture preserved after text update');
  }
}

main().catch(console.error);
