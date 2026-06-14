const { customAlphabet } = require('nanoid');

// URL-safe alphabet, 7 characters — collision probability is negligibly low
const nanoid = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  7
);

/**
 * Generates a unique 7-character URL-safe short code
 * @returns {string} e.g. "xY3aB9z"
 */
const generateShortCode = () => nanoid();

module.exports = generateShortCode;
