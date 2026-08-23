const { body, validationResult } = require('express-validator');

/**
 * Reusable helper — checks validation result and returns error response if any
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validates a URL string using Node.js URL constructor
 */
const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// ── Auth Validations ────────────────────────────────────────────────────────

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// ── URL Validations ─────────────────────────────────────────────────────────

const validateCreateUrl = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('Original URL is required')
    .custom((value) => {
      if (!isValidUrl(value)) {
        throw new Error('Please enter a valid URL (must start with http:// or https://)');
      }
      return true;
    }),

  body('customAlias')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be 3–30 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Custom alias can only contain letters, numbers, and hyphens'),

  body('expiresAt')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Expiry date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),

  handleValidationErrors,
];

const validateUpdateUrl = [
  body('originalUrl')
    .optional({ values: 'falsy' })
    .trim()
    .custom((value) => {
      if (!isValidUrl(value)) {
        throw new Error('Please enter a valid URL (must start with http:// or https://)');
      }
      return true;
    }),

  body('customAlias')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be 3–30 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Custom alias can only contain letters, numbers, and hyphens'),

  body('expiresAt')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Expiry date must be a valid ISO 8601 date'),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateUrl,
  validateUpdateUrl,
  isValidUrl,
};
