const path = require('path');

const allowedExtensionsFromEnv = (process.env.ALLOWED_FILE_TYPES || 'pdf,docx,pptx,xlsx,txt')
  .split(',')
  .map(s => s.trim().toLowerCase());

const ALLOWED_EXTENSIONS = new Set(allowedExtensionsFromEnv);

// check based on original file extension
function isAllowedFile(originalname) {
  const ext = path.extname(originalname).replace('.', '').toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

module.exports = { isAllowedFile, ALLOWED_EXTENSIONS };
