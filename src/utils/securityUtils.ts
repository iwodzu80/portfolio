
/**
 * Security utilities for input validation and sanitation
 */

/**
 * Validates and ensures a URL has a proper safe protocol
 * Allows http, https, mailto, and tel protocols
 */
export const validateAndFormatUrl = (url: string): string => {
  // Return empty string if the URL is empty
  if (!url || url.trim() === '') {
    return '';
  }

  // Check if URL already has a valid protocol
  const hasValidProtocol = /^(https?:\/\/|mailto:|tel:)/i.test(url);
  
  if (hasValidProtocol) {
    return url;
  }
  
  // Add https protocol if missing
  return `https://${url}`;
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

