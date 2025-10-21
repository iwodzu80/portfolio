import DOMPurify from 'dompurify';

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

/**
 * Sanitizes HTML content using DOMPurify
 * Allows safe HTML tags while removing potentially dangerous content
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Add a hook to allow text-align styles
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (data.attrName === 'style') {
      // Only allow text-align CSS property
      const textAlignMatch = data.attrValue.match(/text-align:\s*(left|right|center|justify)/i);
      if (textAlignMatch) {
        data.attrValue = `text-align: ${textAlignMatch[1]};`;
      } else {
        data.attrValue = '';
      }
    }
  });
  
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  });
  
  // Remove the hook after use to prevent side effects
  DOMPurify.removeHook('uponSanitizeAttribute');
  
  return sanitized;
};

