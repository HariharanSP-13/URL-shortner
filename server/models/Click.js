const mongoose = require('mongoose');
const UAParser = require('ua-parser-js');

const clickSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: [true, 'URL ID is required'],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: '',
    },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    browser: {
      type: String,
      default: 'unknown',
    },
  },
  {
    timestamps: false, // timestamp field already present
  }
);

// Static method to create a click with parsed UA info
clickSchema.statics.recordClick = async function ({ urlId, req }) {
  const rawUA = req.headers['user-agent'] || '';
  const xForwardedFor = req.headers['x-forwarded-for'];
  const ip = xForwardedFor
    ? xForwardedFor.split(',')[0].trim()
    : req.ip || 'unknown';

  let device = 'unknown';
  let browser = 'unknown';

  try {
    const parser = new UAParser(rawUA);
    const result = parser.getResult();

    browser = result.browser?.name || 'unknown';

    const deviceType = result.device?.type;
    if (deviceType === 'mobile') device = 'mobile';
    else if (deviceType === 'tablet') device = 'tablet';
    else if (result.os?.name) device = 'desktop'; // has OS but no mobile/tablet device type
    else device = 'unknown';
  } catch (_) {
    // silently fail - analytics are non-critical
  }

  return await this.create({
    urlId,
    ip,
    userAgent: rawUA,
    device,
    browser,
  });
};

// Clean JSON output
clickSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Click', clickSchema);
