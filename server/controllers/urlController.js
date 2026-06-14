const Url = require('../models/Url');
const Click = require('../models/Click');
const generateShortCode = require('../utils/generateShortCode');

/**
 * Build the full short URL string from a URL document
 */
const buildShortUrl = (urlDoc) => {
  const code = urlDoc.customAlias || urlDoc.shortCode;
  return `${process.env.BASE_URL}/${code}`;
};

/**
 * Format a URL document for API response (adds shortUrl field)
 */
const formatUrlResponse = (urlDoc) => {
  const obj = urlDoc.toJSON();
  obj.shortUrl = buildShortUrl(urlDoc);
  return obj;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/urls — Create a new short URL
// ─────────────────────────────────────────────────────────────────────────────
const createUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user._id;

    // Check if custom alias is already taken
    if (customAlias) {
      const aliasTaken = await Url.findOne({
        customAlias: customAlias.toLowerCase(),
      });
      if (aliasTaken) {
        return res.status(409).json({
          success: false,
          message: `Custom alias "${customAlias}" is already taken. Please choose another.`,
        });
      }
    }

    // Generate a unique short code (retry up to 5 times on collision)
    let shortCode;
    let attempts = 0;
    while (attempts < 5) {
      shortCode = generateShortCode();
      const existing = await Url.findOne({ shortCode });
      if (!existing) break;
      attempts++;
    }

    const urlData = {
      userId,
      originalUrl,
      shortCode,
    };

    if (customAlias) urlData.customAlias = customAlias.toLowerCase();
    if (expiresAt) urlData.expiresAt = new Date(expiresAt);

    const url = await Url.create(urlData);

    return res.status(201).json({
      success: true,
      message: 'Short URL created successfully.',
      data: { url: formatUrlResponse(url) },
    });
  } catch (error) {
    console.error('Create URL error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create short URL.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/urls — Get all URLs for logged-in user
// ─────────────────────────────────────────────────────────────────────────────
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Attach lastVisited for each URL
    const urlsWithMeta = await Promise.all(
      urls.map(async (url) => {
        const lastClick = await Click.findOne({ urlId: url._id })
          .sort({ timestamp: -1 })
          .select('timestamp');

        const obj = formatUrlResponse(url);
        obj.totalClicks = url.clicks;
        obj.lastVisited = lastClick ? lastClick.timestamp : null;
        return obj;
      })
    );

    return res.status(200).json({
      success: true,
      data: { urls: urlsWithMeta, count: urlsWithMeta.length },
    });
  } catch (error) {
    console.error('Get URLs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch URLs.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/urls/:id — Delete a URL and all its click records
// ─────────────────────────────────────────────────────────────────────────────
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found.',
      });
    }

    // Ownership check
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this URL.',
      });
    }

    // Delete URL and all associated clicks
    await Promise.all([
      Url.findByIdAndDelete(req.params.id),
      Click.deleteMany({ urlId: req.params.id }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'URL and all associated data deleted successfully.',
    });
  } catch (error) {
    console.error('Delete URL error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete URL.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/urls/:id — Update URL (originalUrl, customAlias, expiresAt)
// ─────────────────────────────────────────────────────────────────────────────
const updateUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found.',
      });
    }

    // Ownership check
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this URL.',
      });
    }

    const { originalUrl, customAlias, expiresAt } = req.body;

    // Check new custom alias is not taken by another document
    if (customAlias && customAlias.toLowerCase() !== url.customAlias) {
      const aliasTaken = await Url.findOne({
        customAlias: customAlias.toLowerCase(),
        _id: { $ne: url._id },
      });
      if (aliasTaken) {
        return res.status(409).json({
          success: false,
          message: `Custom alias "${customAlias}" is already taken.`,
        });
      }
    }

    if (originalUrl) url.originalUrl = originalUrl;
    if (customAlias !== undefined) {
      url.customAlias = customAlias ? customAlias.toLowerCase() : null;
    }
    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await url.save();

    return res.status(200).json({
      success: true,
      message: 'URL updated successfully.',
      data: { url: formatUrlResponse(url) },
    });
  } catch (error) {
    console.error('Update URL error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update URL.',
    });
  }
};

const bulkCreate = async (req, res) => {
  try {
    const { urls } = req.body; // Expects an array of { originalUrl, customAlias?, expiresAt? } or just strings
    const userId = req.user._id;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. "urls" must be an array.',
      });
    }

    const results = [];
    const errors = [];

    for (const item of urls) {
      try {
        let originalUrl, customAlias, expiresAt;
        
        if (typeof item === 'string') {
          originalUrl = item;
        } else {
          ({ originalUrl, customAlias, expiresAt } = item);
        }

        // Basic validation
        if (!originalUrl) continue;

        // Check alias collision
        if (customAlias) {
          const aliasTaken = await Url.findOne({ customAlias: customAlias.toLowerCase() });
          if (aliasTaken) {
            errors.push({ originalUrl, error: `Alias "${customAlias}" already taken` });
            continue;
          }
        }

        // Generate short code
        let shortCode;
        let attempts = 0;
        while (attempts < 5) {
          shortCode = generateShortCode();
          const existing = await Url.findOne({ shortCode });
          if (!existing) break;
          attempts++;
        }

        const urlData = { userId, originalUrl, shortCode };
        if (customAlias) urlData.customAlias = customAlias.toLowerCase();
        if (expiresAt) urlData.expiresAt = new Date(expiresAt);

        const url = await Url.create(urlData);
        results.push(formatUrlResponse(url));
      } catch (err) {
        errors.push({ originalUrl: item.originalUrl || item, error: 'Internal error' });
      }
    }

    return res.status(207).json({
      success: true,
      data: {
        created: results,
        failed: errors,
        totalCreated: results.length,
        totalFailed: errors.length,
      },
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process bulk request.',
    });
  }
};

module.exports = { createUrl, getUserUrls, deleteUrl, updateUrl, bulkCreate };

