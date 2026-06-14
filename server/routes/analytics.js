const express = require('express');
const router = express.Router();
const { getAnalytics, getPublicStats } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/analytics/stats/:shortCode — Public stats for a link
router.get('/stats/:shortCode', getPublicStats);

// Protected routes below
router.use(authMiddleware);

// GET /api/analytics/:urlId — Get analytics for a specific URL
router.get('/:urlId', getAnalytics);

module.exports = router;

