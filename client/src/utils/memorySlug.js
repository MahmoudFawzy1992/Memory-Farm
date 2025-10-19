/**
 * Generate URL slugs for memories and users (frontend version)
 * Matches backend slugify.js logic
 */

function slugify(text, maxLength = 50) {
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .substring(0, maxLength);
}

export function generateMemorySlug(title, id) {
  const titleSlug = slugify(title, 50);
  return `${titleSlug}-${id}`;
}

export function generateUserSlug(displayName, id) {
  const nameSlug = slugify(displayName, 30);
  return `${nameSlug}-${id}`;
}