/**
 * Live server end-to-end profile picture test
 * Run: node test-live-upload.js <TOKEN_FROM_BROWSER>
 * 
 * Token kaise milega:
 *   Browser console mein run karo:
 *   JSON.parse(localStorage.getItem('kosmico_auth_v1')).state.accessToken
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('Usage: node test-live-upload.js <TOKEN>');
  console.log('\nToken lene ke liye browser console mein run karo:');
  console.log("  JSON.parse(localStorage.getItem('kosmico_auth_v1')).state.accessToken");
  process.exit(1);
}

function req(method, urlPath, token, body, contentType) {
  return new Promise((resolve) => {
    const isBuffer = Buffer.isBuffer(body);
    const buf = isBuffer ? body : (body ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)) : null);
    const opts = {
      hostname: 'api.kosmicowellness.com',
      path: urlPath,
      method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(contentType ? { 'Content-Type': contentType } : { 'Content-Type': 'application/json' }),
        ...(buf ? { 'Content-Length': buf.length } : {}),
      }
    };
    const r = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', e => resolve({ status: 0, body: e.message }));
    if (buf) r.write(buf);
    r.end();
  });
}

// Minimal valid JPEG (1x1 pixel, ~100 bytes)
const TINY_JPEG = Buffer.from(
  'ffd8ffe000104a46494600010101004800480000' +
  'ffdb004300080606070605080707070909080a0c140d0c0b0b0c19' +
  '12130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30' +
  '313434341f27393d38323c2e333432ffc0000b080001000101011100' +
  'ffda0008010100003f00d2cf20ffd9',
  'hex'
);

function makeMultipart(fieldName, fileBuffer, boundary) {
  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fieldName}"; filename="test-${Date.now()}.jpg"\r\n` +
    `Content-Type: image/jpeg\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  return Buffer.concat([header, fileBuffer, footer]);
}

async function main() {
  const boundary = 'KosmicoTest' + Date.now();

  console.log('=== Live Server Profile Picture Sync Test ===\n');
  console.log('Token:', TOKEN.slice(0, 30) + '...\n');

  // ── Step 1: Get current profile ────────────────────────────────────
  console.log('1️⃣  GET /api/auth/profile (current state)');
  const before = await req('GET', '/api/auth/profile', TOKEN);
  if (before.status === 401) {
    console.log('   ❌ 401 Unauthorized — token expired hai, naya token lo');
    process.exit(1);
  }
  const u = before.body?.data?.user || before.body?.data || {};
  console.log('   Status:', before.status);
  console.log('   name:', u.name);
  console.log('   profilePicture:', u.profilePicture || '(empty)');
  console.log('   profileImage:', u.profileImage || '(empty)');
  console.log('   avatar:', u.avatar || '(empty)');

  // ── Step 2: Upload picture via PUT /api/auth/profile-picture ───────
  console.log('\n2️⃣  PUT /api/auth/profile-picture (multipart upload)');
  const payload = makeMultipart('profilePicture', TINY_JPEG, boundary);
  const upload = await req(
    'PUT', '/api/auth/profile-picture', TOKEN,
    payload, `multipart/form-data; boundary=${boundary}`
  );
  console.log('   Status:', upload.status);
  const uu = upload.body?.data?.user || upload.body?.data || upload.body;
  console.log('   Response profilePicture:', uu?.profilePicture || '(not in response)');
  console.log('   Full response keys:', Object.keys(uu || {}).join(', '));

  if (upload.status !== 200) {
    console.log('   Full response:', JSON.stringify(upload.body).slice(0, 500));
  }

  // ── Step 3: Verify DB was updated ──────────────────────────────────
  console.log('\n3️⃣  GET /api/auth/profile (verify DB updated)');
  await new Promise(r => setTimeout(r, 1000)); // wait 1s
  const after = await req('GET', '/api/auth/profile', TOKEN);
  const u2 = after.body?.data?.user || after.body?.data || {};
  console.log('   profilePicture:', u2.profilePicture || '(empty)');
  console.log('   profileImage:', u2.profileImage || '(empty)');
  console.log('   avatar:', u2.avatar || '(empty)');

  const picChanged = u2.profilePicture !== u.profilePicture;
  console.log(picChanged
    ? '\n   ✅ DB UPDATED — picture URL changed'
    : '\n   ❌ DB NOT UPDATED — same picture as before');

  // ── Step 4: Check if picture URL is accessible ──────────────────────
  if (u2.profilePicture && u2.profilePicture.startsWith('http')) {
    console.log('\n4️⃣  Checking if picture URL is publicly accessible...');
    const picUrl = new URL(u2.profilePicture);
    const accessible = await new Promise((resolve) => {
      const r = https.request({ hostname: picUrl.hostname, path: picUrl.pathname, method: 'HEAD' }, (res) => {
        resolve({ status: res.statusCode });
      });
      r.on('error', e => resolve({ status: 0, err: e.message }));
      r.end();
    });
    console.log('   URL:', u2.profilePicture);
    console.log('   HTTP Status:', accessible.status, accessible.status === 200 ? '✅ Accessible' : '❌ NOT accessible');
  }

  // ── Step 5: Test text-only update (does it erase picture?) ─────────
  console.log('\n5️⃣  PUT /api/auth/profile (text-only — name update only)');
  const textUpdate = await req('PUT', '/api/auth/profile', TOKEN, { name: u2.name || 'Test' });
  console.log('   Status:', textUpdate.status);

  const after2 = await req('GET', '/api/auth/profile', TOKEN);
  const u3 = after2.body?.data?.user || after2.body?.data || {};
  console.log('   profilePicture after text update:', u3.profilePicture || '(ERASED ❌)');

  if (!u3.profilePicture && u2.profilePicture) {
    console.log('\n   🔴 BUG: Text-only update ERASED the profile picture!');
    console.log('   This is why web changes dont show in app.');
    console.log('   Live server pe fix deploy karna hoga.');
  } else if (u3.profilePicture) {
    console.log('\n   ✅ Picture preserved after text update');
  }

  // ── Summary ──────────────────────────────────────────────────────
  console.log('\n=== Summary ===');
  console.log('Upload worked:', upload.status === 200 ? '✅' : '❌ ' + upload.status);
  console.log('DB updated:', picChanged ? '✅' : '❌');
  console.log('Picture URL accessible:', u2.profilePicture ? '(check above)' : 'N/A');
}

main().catch(console.error);
