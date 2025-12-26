/**
 * Validation utilities
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate email recipients array
 * @param {Array} recipients - Array of recipient objects with email property
 * @returns {boolean} - Whether all recipients have valid emails
 */
export function validateRecipients(recipients) {
  if (!Array.isArray(recipients) || recipients.length === 0) return false;
  return recipients.every(r => isValidEmail(r.email));
}

/**
 * Check if a string is empty or only whitespace
 * @param {string} str - String to check
 * @returns {boolean} - Whether the string is empty
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Check if subject is valid (not empty and not too long)
 * @param {string} subject - Email subject
 * @returns {boolean} - Whether subject is valid
 */
export function isValidSubject(subject) {
  if (!subject) return false;
  const trimmed = subject.trim();
  return trimmed.length > 0 && trimmed.length <= 998; // RFC 2822 limit
}

/**
 * Sanitize HTML content (basic sanitization)
 * @param {string} html - HTML content
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  // Remove script tags
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
