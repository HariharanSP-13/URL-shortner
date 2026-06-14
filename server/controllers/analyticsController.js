const Click = require('../models/Click');
const Url = require('../models/Url');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/:urlId
// Returns: totalClicks, lastVisited, recentVisits (last 10), dailyClicks (30 days)
// ─────────────────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const { urlId } = req.params;

    // Verify URL exists and belongs to this user
    const url = await Url.findById(urlId);
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found.',
      });
    }

    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view analytics for this URL.',
      });
    }

    // ── Total clicks ────────────────────────────────────────────────────────
    const totalClicks = url.clicks;

    // ── Last visited ────────────────────────────────────────────────────────
    const lastClickDoc = await Click.findOne({ urlId })
      .sort({ timestamp: -1 })
      .select('timestamp');
    const lastVisited = lastClickDoc ? lastClickDoc.timestamp : null;

    // ── Recent visits (last 10) ─────────────────────────────────────────────
    const recentVisits = await Click.find({ urlId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('timestamp ip device browser userAgent -_id');

    // ── Daily clicks for last 30 days ───────────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // include today = 30 days
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // MongoDB aggregation — group by local date string
    const rawDailyClicks = await Click.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build a map of existing data
    const clickMap = {};
    rawDailyClicks.forEach(({ _id, count }) => {
      clickMap[_id] = count;
    });

    // Fill in all 30 days — including 0-click days
    const dailyClicks = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      dailyClicks.push({
        date: dateStr,
        count: clickMap[dateStr] || 0,
      });
    }

    // ── URL metadata ────────────────────────────────────────────────────────
    const activeCode = url.customAlias || url.shortCode;
    const shortUrl = `${process.env.BASE_URL}/${activeCode}`;

    return res.status(200).json({
      success: true,
      data: {
        url: {
          _id: url._id,
          originalUrl: url.originalUrl,
          shortUrl,
          shortCode: url.shortCode,
          customAlias: url.customAlias,
          expiresAt: url.expiresAt,
          createdAt: url.createdAt,
        },
        totalClicks,
        lastVisited,
        recentVisits,
        dailyClicks,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stats/:shortCode
// Public endpoint, returns basic stats for a link
// ─────────────────────────────────────────────────────────────────────────────
const getPublicStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL by code or alias
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode.toLowerCase() }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Link not found.',
      });
    }

    // Daily clicks for last 7 days (simplified for public)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rawDailyClicks = await Click.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const clickMap = {};
    rawDailyClicks.forEach(({ _id, count }) => {
      clickMap[_id] = count;
    });

    const dailyClicks = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyClicks.push({
        date: dateStr,
        count: clickMap[dateStr] || 0,
      });
    }

    // Top browsers/devices (public insight)
    const deviceStats = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const activeCode = url.customAlias || url.shortCode;
    const shortUrl = `${process.env.BASE_URL}/${activeCode}`;

    return res.status(200).json({
      success: true,
      data: {
        url: {
          originalUrl: url.originalUrl,
          shortUrl,
          createdAt: url.createdAt,
        },
        totalClicks: url.clicks,
        dailyClicks,
        deviceStats: deviceStats.map((d) => ({
          device: d._id || 'Unknown',
          count: d.count,
        })),
      },
    });
  } catch (error) {
    console.error('Public stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public stats.',
    });
  }
};

module.exports = { getAnalytics, getPublicStats };

