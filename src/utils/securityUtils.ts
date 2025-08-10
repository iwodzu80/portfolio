
/**
 * Security utilities for input validation and sanitation
 */

/**
 * Validates and ensures a URL has a proper safe protocol
 * Allows http, https, mailto, and tel protocols
 */
export const validateAndFormatUrl = (url: string): string => {
  // Return empty string if the URL is empty
  if (!url) return '';
  let input = url.trim();
  if (input === '') return '';

  // Normalize protocol-relative URLs
  if (input.startsWith('//')) {
    input = `https:${input}`;
  }

  const protocolPattern = /^(https?:\/\/|mailto:|tel:)/i;

  // Try to parse; if missing protocol, default to https
  let parsed: URL;
  try {
    parsed = new URL(protocolPattern.test(input) ? input : `https://${input}`);
  } catch (_e) {
    return '';
  }

  // Allowlist of safe protocols
  const allowed = new Set(['http:', 'https:', 'mailto:', 'tel:']);
  if (!allowed.has(parsed.protocol)) {
    return '';
  }

  // Lowercase hostname for consistency
  if (parsed.hostname) parsed.hostname = parsed.hostname.toLowerCase();

  return parsed.toString();
};

/**
 * Sanitizes text to prevent XSS attacks
 * This is a simple implementation - for more complex HTML content,
 * consider using DOMPurify or similar libraries
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Escape HTML special characters
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

