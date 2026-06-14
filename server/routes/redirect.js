const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const Click = require('../models/Click');

// GET /:shortCode — Public redirect route
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Look up by customAlias first, then shortCode
    const url = await Url.findOne({
      $or: [{ customAlias: shortCode.toLowerCase() }, { shortCode }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: `No URL found for short code "${shortCode}".`,
      });
    }

    // Check expiry
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This short URL has expired.',
      });
    }

    // Increment total clicks counter (non-blocking)
    Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } }).exec();

    // Record click analytics (non-blocking)
    Click.recordClick({ urlId: url._id, req }).catch((err) =>
      console.error('Failed to record click:', err)
    );

    // 302 redirect (temporary — allows re-routing if original URL changes)
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during redirect.',
    });
  }
});

module.exports = router;
