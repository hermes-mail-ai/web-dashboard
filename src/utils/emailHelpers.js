/**
 * Email-related helper utilities
 */

/**
 * Get folder configuration from URL path
 * @param {string} pathname - URL pathname
 * @returns {Object} - Folder configuration { folder, category? }
 */
export function getFolderFromPath(pathname) {
  if (pathname.includes('/starred')) return { folder: 'starred' };
  if (pathname.includes('/snoozed')) return { folder: 'inbox' }; // Snoozed not supported yet
  if (pathname.includes('/sent')) return { folder: 'all' }; // Sent not separate folder yet
  if (pathname.includes('/drafts')) return { folder: 'inbox' }; // Drafts not supported yet
  if (pathname.includes('/purchases')) return { folder: 'inbox', category: 'promotions' };
  if (pathname.includes('/important')) return { folder: 'inbox' };
  if (pathname.includes('/spam')) return { folder: 'inbox' }; // Could add spam folder later
  if (pathname.includes('/trash')) return { folder: 'trash' };
  if (pathname.includes('/all')) return { folder: 'all' };
  if (pathname.includes('/archived')) return { folder: 'archived' };
  return { folder: 'inbox' };
}

/**
 * Email category definitions
 */
export const EMAIL_CATEGORIES = [
  { id: 'primary', label: 'Primary' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'notifications', label: 'Notifications' },
];

/**
 * Check if an email matches a category filter
 * @param {Object} email - Email object
 * @param {string} activeCategory - Active category ID
 * @returns {boolean} - Whether email matches the category
 */
export function emailMatchesCategory(email, activeCategory) {
  const emailCategory = email.category?.toLowerCase();

  if (activeCategory === 'notifications') {
    // Notifications includes 'notifications', 'updates', 'social'
    return ['notifications', 'updates', 'social'].includes(emailCategory);
  }

  return emailCategory === activeCategory;
}

/**
 * Empty state configuration for different folders
 * Icons are represented as string keys that can be mapped to actual icons
 */
export const EMPTY_STATE_CONFIGS = {
  starred: {
    iconType: 'star',
    title: 'No starred emails',
    description: 'Star emails to find them easily later.'
  },
  sent: {
    iconType: 'send',
    title: 'No sent emails',
    description: 'Emails you send will appear here.'
  },
  drafts: {
    iconType: 'file',
    title: 'No drafts',
    description: 'Drafts you start will be saved here.'
  },
  trash: {
    iconType: 'trash',
    title: 'Trash is empty',
    description: 'Deleted emails will appear here.'
  },
  spam: {
    iconType: 'alert',
    title: 'No spam',
    description: 'Spam emails will be filtered here.'
  },
  archived: {
    iconType: 'archive',
    title: 'No archived emails',
    description: 'Archived emails will appear here.'
  },
  primary: {
    iconType: 'inbox',
    title: 'All caught up!',
    description: 'No primary emails to show. Sync to check for new mail.'
  },
  promotions: {
    iconType: 'tag',
    title: 'No promotions',
    description: 'Promotional emails will appear here.'
  },
  notifications: {
    iconType: 'bell',
    title: 'No notifications',
    description: 'Notification emails will appear here.'
  },
  default: {
    iconType: 'inbox',
    title: 'No emails',
    description: 'Your inbox is empty.'
  }
};

/**
 * Get empty state configuration for a folder/category
 * @param {string} pathname - URL pathname
 * @param {string} category - Active category
 * @returns {Object} - Empty state config
 */
export function getEmptyStateConfig(pathname, category) {
  if (pathname.includes('/starred')) return EMPTY_STATE_CONFIGS.starred;
  if (pathname.includes('/sent')) return EMPTY_STATE_CONFIGS.sent;
  if (pathname.includes('/drafts')) return EMPTY_STATE_CONFIGS.drafts;
  if (pathname.includes('/trash')) return EMPTY_STATE_CONFIGS.trash;
  if (pathname.includes('/spam')) return EMPTY_STATE_CONFIGS.spam;
  if (pathname.includes('/archived')) return EMPTY_STATE_CONFIGS.archived;

  // For inbox, check category
  if (category === 'promotions') return EMPTY_STATE_CONFIGS.promotions;
  if (category === 'notifications') return EMPTY_STATE_CONFIGS.notifications;

  return EMPTY_STATE_CONFIGS.primary;
}

/**
 * Decode HTML entities in text (e.g., &#39; -> ')
 * @param {string} text - Text that may contain HTML entities
 * @returns {string} - Decoded text
 */
export function decodeHtmlEntities(text) {
  if (!text) return '';
  // Use browser's built-in HTML entity decoder
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Dark mode styles for email content iframe
 */
export const EMAIL_DARK_MODE_STYLES = `
  <style>
    html, body {
      background-color: #0f172a !important;
      color: #e2e8f0 !important;
      margin: 0 !important;
      padding: 16px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    * {
      color: inherit !important;
      border-color: #334155 !important;
    }
    a {
      color: #60a5fa !important;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    table {
      border-collapse: collapse !important;
    }
    td, th {
      padding: 8px !important;
    }
    blockquote {
      border-left: 3px solid #475569 !important;
      padding-left: 12px !important;
      margin-left: 0 !important;
      color: #94a3b8 !important;
    }
    pre, code {
      background-color: #1e293b !important;
      padding: 8px !important;
      border-radius: 4px !important;
      overflow-x: auto !important;
    }
  </style>
`;
