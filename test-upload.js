const https = require('https');

const boundary = '----WebKitFormBoundary12345';
const dummyJpg = Buffer.from('ffd8ffe000104a46494600010101004800480000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffda0008010100003f00d2cf20ffd9', 'hex');

const endpoints = [
  '/api/auth/profile-picture',
  '/api/auth/profile',
];

const fields = ['profilePicture', 'profileImage', 'image', 'file', 'photo'];

endpoints.forEach(endpoint => {
  fields.forEach(fieldName => {

    const header = Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="' + fieldName + '"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\n');
    const footer = Buffer.from('\r\n--' + boundary + '--\r\n');
    const payload = Buffer.concat([header, dummyJpg, footer]);

    const req = https.request({
      hostname: 'api.kosmicowellness.com',
      path: endpoint,
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': payload.length,
        'User-Agent': 'KosmicoApp/1.0',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => console.log('PUT ' + endpoint + ' [' + fieldName + '] => Status:', res.statusCode, data.slice(0, 80)));
    });
    req.on('error', e => console.error(endpoint, fieldName, e.message));
    req.write(payload);
    req.end();
  });
});
