const fs = require('fs');
const path = require('path');

/**
 * Saves uploaded buffer or Base64 image to server disk under /uploads/
 * and returns a standard full HTTPS URL compatible with React Native, Flutter, Android, iOS and Web.
 * URL format matches Production Base URL: https://api.kosmicowellness.com/uploads/profilePicture-<timestamp>.jpg
 */
function saveProfileImage(input, userId, req) {
  if (!input) return '';

  const inputStr = typeof input === 'string' ? input.trim() : '';

  // If already a valid public HTTP/HTTPS URL, return it directly
  if (inputStr.startsWith('http://') || inputStr.startsWith('https://')) {
    // Normalize localhost or direct IP to production domain https://api.kosmicowellness.com
    if (inputStr.includes('localhost:5000') || inputStr.includes('127.0.0.1:5000') || inputStr.includes('3.7.180.215:5000')) {
      return inputStr.replace(/http:\/\/(localhost|127\.0\.0\.1|3\.7\.180\.215):5000/, 'https://api.kosmicowellness.com');
    }
    return inputStr;
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
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

  // Generate filename matching exact mobile app pattern: profilePicture-<timestamp>.jpg
  const filename = `profilePicture-${Date.now()}.${ext}`;
  const filePath = path.join(uploadsDir, filename);

  try {
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.error('Error writing profile image file:', err);
    return inputStr;
  }

  // Base public URL strictly https://api.kosmicowellness.com
  let baseUrl = 'https://api.kosmicowellness.com';
  if (process.env.BACKEND_URL) {
    baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
  }

  return `${baseUrl}/uploads/${filename}`;
}

module.exports = {
  saveProfileImage,
};
