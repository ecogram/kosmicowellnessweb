/**
 * Normalizes any image URL (especially backend uploads and mobile app filenames)
 * to secure HTTPS to prevent browser Mixed Content blocking on https://www.kosmicowellness.com
 */
export const normalizeImageUrl = (url?: string | null): string => {
  if (!url) return '';
  let normalized = String(url).trim();
  if (!normalized) return '';
  if (normalized.startsWith('data:image') || normalized.startsWith('blob:')) return normalized;

  // Replace Windows backslashes with standard forward slashes
  normalized = normalized.replace(/\\/g, '/');

  // Replace legacy IP and insecure HTTP endpoints with secure HTTPS API domain
  normalized = normalized.replace(/^http:\/\/3\.7\.180\.215:5000/i, 'https://api.kosmicowellness.com');
  normalized = normalized.replace(/^https:\/\/3\.7\.180\.215:5000/i, 'https://api.kosmicowellness.com');
  normalized = normalized.replace(/^http:\/\/api\.kosmicowellness\.com/i, 'https://api.kosmicowellness.com');
  normalized = normalized.replace(/^http:\/\/localhost:5000/i, 'https://api.kosmicowellness.com');

  // Handle various relative path formats from mobile app or backend
  if (normalized.startsWith('/uploads/')) {
    normalized = `https://api.kosmicowellness.com${normalized}`;
  } else if (normalized.startsWith('uploads/')) {
    normalized = `https://api.kosmicowellness.com/${normalized}`;
  } else if (normalized.startsWith('/profiles/')) {
    normalized = `https://api.kosmicowellness.com/uploads${normalized}`;
  } else if (normalized.startsWith('profiles/')) {
    normalized = `https://api.kosmicowellness.com/uploads/${normalized}`;
  } else if (normalized.startsWith('/api/uploads/')) {
    normalized = `https://api.kosmicowellness.com${normalized.replace('/api', '')}`;
  } else if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    // Plain filename or relative path (e.g. profilePicture-1727...jpg)
    normalized = `https://api.kosmicowellness.com/uploads/${normalized.replace(/^\//, '')}`;
  }

  // Force HTTPS if hosted on kosmicowellness.com to prevent browser Mixed Content errors
  if (normalized.startsWith('http://api.kosmicowellness.com')) {
    normalized = normalized.replace('http://', 'https://');
  } else if (normalized.startsWith('http://www.kosmicowellness.com')) {
    normalized = normalized.replace('http://', 'https://');
  }

  return normalized;
};

