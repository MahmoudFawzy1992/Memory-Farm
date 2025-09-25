// Image validation constants and configuration
export const ALLOWED_FILE_TYPES = {
  'image/jpeg': { extensions: ['jpg', 'jpeg'], maxSize: 1024 * 1024 },
  'image/png': { extensions: ['png'], maxSize: 1024 * 1024 },
  'image/webp': { extensions: ['webp'], maxSize: 1024 * 1024 },
  'image/gif': { extensions: ['gif'], maxSize: 1024 * 1024 },
};

export const VALIDATION_PATTERNS = {
  suspicious: [
    /\.php\./i, /\.asp\./i, /\.jsp\./i, /\.exe\./i,
    /script/i, /javascript/i, /vbscript/i,
    /<script/i, /javascript:/i
  ]
};

export const FILE_LIMITS = {
  maxFilenameLength: 255,
  maxImageCount: 5
};