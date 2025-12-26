/**
 * Date and text formatting utilities
 */

/**
 * Format date for email list display (smart formatting based on age)
 * - Today: shows time (e.g., "2:30 PM")
 * - This week: shows weekday (e.g., "Mon")
 * - Older: shows date (e.g., "Dec 15")
 */
export function formatEmailDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Format date for full display with time
 * e.g., "Mon, Dec 15, 2024, 2:30 PM"
 */
export function formatFullDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date for email detail view
 * e.g., "Monday, December 15, 2024, 2:30 PM"
 */
export function formatDetailDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date for people/contacts list (relative)
 * e.g., "Today", "Yesterday", "3 days ago", "2 weeks ago"
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

/**
 * Format date for simple display
 * e.g., "December 15, 2024"
 */
export function formatSimpleDate(dateString) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @param {string} [fallback] - Optional fallback (e.g., email) if name is empty
 * @returns {string} - Initials (e.g., "JD" for "John Doe")
 */
export function getInitials(name, fallback = '?') {
  if (!name) {
    return typeof fallback === 'string' && fallback.length > 0
      ? fallback[0].toUpperCase()
      : '?';
  }
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

/**
 * Get initials from user object
 * @param {Object} user - User object with name property
 * @returns {string} - Initials
 */
export function getUserInitials(user) {
  return getInitials(user?.name);
}
