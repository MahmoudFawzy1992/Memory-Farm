/**
 * Generate URL-friendly slugs for memories and users
 * Format: "readable-text-FULL_OBJECTID"
 * 
 * Examples:
 * - Memory: "my-first-day-at-work-68dbb9b531eee227a8b42340"
 * - User: "john-smith-68d614a0a6e8a0cb3e0fee00"
 */

/**
 * Convert text to URL-safe slug
 * @param {string} text - Text to slugify
 * @param {number} maxLength - Maximum length of slug (before ID)
 * @returns {string} - Slugified text
 */
function slugify(text, maxLength = 50) {
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove apostrophes
    .replace(/['']/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-word chars except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    // Limit length
    .substring(0, maxLength);
}

/**
 * Generate memory slug from title and ID
 * @param {string} title - Memory title
 * @param {string} id - Memory ObjectId
 * @returns {string} - Full slug: "title-ID"
 */
function generateMemorySlug(title, id) {
  const titleSlug = slugify(title, 50);
  return `${titleSlug}-${id}`;
}

/**
 * Generate user slug from display name and ID
 * @param {string} displayName - User's display name
 * @param {string} id - User ObjectId
 * @returns {string} - Full slug: "name-ID"
 */
function generateUserSlug(displayName, id) {
  const nameSlug = slugify(displayName, 30);
  return `${nameSlug}-${id}`;
}

/**
 * Extract ObjectId from slug
 * Handles both formats:
 * - New: "my-title-68dbb9b531eee227a8b42340"
 * - Old: "68dbb9b531eee227a8b42340"
 * 
 * @param {string} slug - Slug or ID
 * @returns {string} - Extracted ObjectId
 */
function extractIdFromSlug(slug) {
  if (!slug) return null;
  
  // If it's already a valid 24-char MongoDB ObjectId, return it
  if (/^[0-9a-fA-F]{24}$/.test(slug)) {
    return slug;
  }
  
  // Extract last 24 characters (the ObjectId)
  const lastPart = slug.slice(-24);
  
  // Verify it's a valid ObjectId format
  if (/^[0-9a-fA-F]{24}$/.test(lastPart)) {
    return lastPart;
  }
  
  // Fallback: return original slug (for error handling)
  return slug;
}

module.exports = {
  slugify,
  generateMemorySlug,
  generateUserSlug,
  extractIdFromSlug
};