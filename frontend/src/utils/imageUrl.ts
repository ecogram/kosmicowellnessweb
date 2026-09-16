/**
 * Normalizes any image URL (especially backend uploads) to secure HTTPS
 * to prevent browser Mixed Content blocking on https://www.kosmicowellness.com
 */
export const normalizeImageUrl = (url?: string | null): string => {
  if (!url) return '';
  let normalized = String(url).trim();
  if (!normalized) return '';
  if (normalized.startsWith('data:image')) return normalized;

  // Replace legacy IP and insecure HTTP endpoints with secure HTTPS API domain
  normalized = normalized.replace(/^http:\/\/3\.7\.180\.215:5000/i, 'https://api.kosmicowellness.com');
  normalized = normalized.replace(/^https:\/\/3\.7\.180\.215:5000/i, 'https://api.kosmicowellness.com');
  normalized = normalized.replace(/^http:\/\/api\.kosmicowellness\.com/i, 'https://api.kosmicowellness.com');
  normalized = normalized.replace(/^http:\/\/localhost:5000/i, 'https://api.kosmicowellness.com');

  // If path starts with /uploads/
  if (normalized.startsWith('/uploads')) {
    normalized = `https://api.kosmicowellness.com${normalized}`;
  }

  return normalized;
};
