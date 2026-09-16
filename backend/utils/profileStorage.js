const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists on EC2 server local disk
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Saves uploaded buffer, Multer file, or Base64 image directly to EC2 local disk under /uploads/
 * and returns the standard full public HTTPS URL for Mobile App and Web.
 * URL format: https://api.kosmicowellness.com/uploads/profilePicture-<timestamp>.jpg
 */
function saveProfileImage(input, userId, req) {
  if (!input) return '';

  const inputStr = typeof input === 'string' ? input.trim() : '';

  // If already a valid public HTTP/HTTPS URL
  if (inputStr.startsWith('http://') || inputStr.startsWith('https://')) {
    // Normalize EC2 IP or localhost to production domain https://api.kosmicowellness.com
    if (inputStr.includes('3.7.180.215:5000') || inputStr.includes('localhost:5000') || inputStr.includes('127.0.0.1:5000')) {
      return inputStr.replace(/http:\/\/(localhost|127\.0\.0\.1|3\.7\.180\.215):5000/, 'https://api.kosmicowellness.com');
    }
    return inputStr;
  }

  let buffer;
  let ext = 'jpg';

  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (input.buffer && Buffer.isBuffer(input.buffer)) {
    buffer = input.buffer;
    ext = input.originalname ? path.extname(input.originalname).replace('.', '') : 'jpg';
  } else if (input.path && fs.existsSync(input.path)) {
    // Already saved to disk by multer diskStorage
    const filename = path.basename(input.path);
    let baseUrl = 'https://api.kosmicowellness.com';
    if (process.env.BACKEND_URL) {
      baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
    }
    return `${baseUrl}/uploads/${filename}`;
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

  // Exact mobile app pattern: profilePicture-<timestamp>.jpg
  const filename = `profilePicture-${Date.now()}.${ext || 'jpg'}`;
  const filePath = path.join(uploadsDir, filename);

  try {
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.error('Error writing profile image to server disk:', err);
    return inputStr;
  }

  let baseUrl = 'https://api.kosmicowellness.com';
  if (process.env.BACKEND_URL) {
    baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
  }

  return `${baseUrl}/uploads/${filename}`;
}

/**
 * Saves community post media files (images / videos) directly to EC2 local disk under /uploads/
 */
function saveMediaFile(input, prefix = 'postMedia') {
  if (!input) return '';

  const inputStr = typeof input === 'string' ? input.trim() : '';
  if (inputStr.startsWith('http://') || inputStr.startsWith('https://')) {
    if (inputStr.includes('3.7.180.215:5000') || inputStr.includes('localhost:5000') || inputStr.includes('127.0.0.1:5000')) {
      return inputStr.replace(/http:\/\/(localhost|127\.0\.0\.1|3\.7\.180\.215):5000/, 'https://api.kosmicowellness.com');
    }
    return inputStr;
  }

  let buffer;
  let ext = 'jpg';

  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (input.buffer && Buffer.isBuffer(input.buffer)) {
    buffer = input.buffer;
    ext = input.originalname ? path.extname(input.originalname).replace('.', '') : 'jpg';
  } else if (input.path && fs.existsSync(input.path)) {
    const filename = path.basename(input.path);
    let baseUrl = 'https://api.kosmicowellness.com';
    if (process.env.BACKEND_URL) baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
    return `${baseUrl}/uploads/${filename}`;
  } else if (inputStr.startsWith('data:image/') || inputStr.startsWith('data:video/')) {
    const matches = inputStr.match(/^data:(?:image|video)\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      return inputStr;
    }
  } else {
    return inputStr;
  }

  const filename = `${prefix}-${Date.now()}.${ext || 'jpg'}`;
  const filePath = path.join(uploadsDir, filename);

  try {
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.error('Error writing media file to server disk:', err);
    return inputStr;
  }

  let baseUrl = 'https://api.kosmicowellness.com';
  if (process.env.BACKEND_URL) {
    baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
  }

  return `${baseUrl}/uploads/${filename}`;
}

module.exports = {
  saveProfileImage,
  saveMediaFile,
};
