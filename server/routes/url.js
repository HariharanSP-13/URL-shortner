const express = require('express');
const router = express.Router();
const {
  createUrl,
  getUserUrls,
  deleteUrl,
  updateUrl,
  bulkCreate,
} = require('../controllers/urlController');

const authMiddleware = require('../middleware/authMiddleware');
const { validateCreateUrl, validateUpdateUrl } = require('../middleware/validateUrl');

// All routes require authentication
router.use(authMiddleware);

// POST /api/urls — Create short URL
router.post('/', validateCreateUrl, createUrl);

// POST /api/urls/bulk — Bulk create URLs
router.post('/bulk', bulkCreate);

// GET /api/urls — Get all URLs for logged-in user
router.get('/', getUserUrls);

// DELETE /api/urls/:id — Delete a URL
router.delete('/:id', deleteUrl);

// PUT /api/urls/:id — Update a URL
router.put('/:id', validateUpdateUrl, updateUrl);

module.exports = router;
