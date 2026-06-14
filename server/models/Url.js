const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9-]{3,30}$/,
        'Custom alias must be 3–30 alphanumeric characters or hyphens',
      ],
    },
    clicks: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: the active short identifier (alias takes priority)
urlSchema.virtual('activeCode').get(function () {
  return this.customAlias || this.shortCode;
});

// Clean JSON output — remove __v
urlSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.id; // remove duplicate id (we keep _id)
    return ret;
  },
});

module.exports = mongoose.model('Url', urlSchema);
