const fs = require('fs');
const path = require('path');

/**
 * Saves uploaded buffer or Base64 image to server disk under /uploads/profiles/
 * and returns a standard full HTTP/HTTPS URL compatible with React Native, Flutter, Android, iOS and Web.
 */
function saveProfileImage(input, userId, req) {
  if (!input) return '';

  const inputStr = typeof input === 'string' ? input.trim() : '';

  // If already an HTTP/HTTPS URL, return it directly
  if (inputStr.startsWith('http://') || inputStr.startsWith('https://')) {
    return inputStr;
  }

  const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }

  let buffer;
  let ext = 'jpg';

  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (inputStr.startsWith('data:image/')) {
    const matches = inputStr.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      return inputStr;
    }
  } else {
    return inputStr;
  }

  const cleanUserId = userId ? userId.toString().replace(/[^a-zA-Z0-9]/g, '') : 'user';
  const filename = `profile_${cleanUserId}_${Date.now()}.${ext}`;
  const filePath = path.join(profilesDir, filename);

  try {
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.error('Error writing profile image file:', err);
    return inputStr;
  }

  // Determine base public URL
  let baseUrl = 'https://kosmicowellness.com';
  if (process.env.BACKEND_URL) {
    baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
  } else if (req) {
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    if (host && !host.includes('kosmicowellness.com')) {
      baseUrl = `${protocol}://${host}`;
    }
  }

  return `${baseUrl}/uploads/profiles/${filename}`;
}

module.exports = {
  saveProfileImage,
};
