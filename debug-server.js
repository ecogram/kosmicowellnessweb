/**
 * Debug script — checks what the LIVE production server returns
 * Run: node debug-server.js
 */
const https = require('https');
const jwt = require('jsonwebtoken');

// Generate a test token using the same secret as the live server
const JWT_SECRET = 'Kosmico_Secret_Key_123';

// We need a real user ID from the DB — let's first call login to get a token
// OR we can generate a fake one to see the actual 401 vs 404 vs other errors

function httpsGet(path, token) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.kosmicowellness.com',
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 200) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.end();
  });
}

function httpsRequest(method, path, token, bodyBuffer, contentType) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.kosmicowellness.com',
      path,
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': contentType || 'application/json',
        'Content-Length': bodyBuffer ? bodyBuffer.length : 0,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    if (bodyBuffer) req.write(bodyBuffer);
    req.end();
  });
}

async function main() {
  console.log('=== Kosmico Live Server Route Diagnostic ===\n');

  // Step 1: Check if server is alive
  const ping = await httpsGet('/api/auth/profile');
  console.log('1. GET /api/auth/profile (no token):', ping.status, '—', ping.body.slice(0, 100));

  // Step 2: Send OTP to get a real token
  const emailBody = JSON.stringify({ email: 'eco124977@gmail.com', type: 'login' });
  const otpReq = await httpsRequest('POST', '/api/auth/login', null, Buffer.from(emailBody), 'application/json');
  console.log('\n2. POST /api/auth/login:', otpReq.status, '—', otpReq.body.slice(0, 150));

  // Step 3: Test routes with a fake token (to see 401 vs 404)
  const fakeToken = jwt.sign({ id: '000000000000000000000000' }, JWT_SECRET, { expiresIn: '1m' });
  
  console.log('\n--- Route Existence Check (401 = route exists but no auth, 404 = route missing) ---\n');

  const routes = [
    ['GET',    '/api/auth/profile'],
    ['PUT',    '/api/auth/profile'],
    ['PUT',    '/api/auth/profile-picture'],
    ['POST',   '/api/auth/profile-picture'],
    ['PATCH',  '/api/auth/profile-picture'],
    ['DELETE', '/api/auth/remove-profile-picture'],
    ['DELETE', '/api/auth/profile-picture'],
  ];

  for (const [method, path] of routes) {
    const jsonBody = Buffer.from('{}');
    const r = await httpsRequest(method, path, fakeToken, jsonBody, 'application/json');
    const exists = r.status !== 404 ? '✅ EXISTS' : '❌ MISSING';
    console.log(`  ${method.padEnd(7)} ${path.padEnd(40)} => ${r.status} ${exists}`);
  }

  console.log('\n=== Done ===');
  console.log('\nNOTE: If routes show 404, the EC2 production server has NOT pulled the latest code.');
  console.log('EC2 pe SSH karke: git pull && pm2 restart all');
}

main().catch(console.error);
