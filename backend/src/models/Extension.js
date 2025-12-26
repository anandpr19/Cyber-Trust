const mongoose = require('mongoose');

const ExtensionSchema = new mongoose.Schema({
  extensionId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    default: 'Unknown'
  },
  version: {
    type: String,
    default: '0.0.0'
  },
  manifest: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  permissions: {
    type: [String],
    default: []
  },
  // FIX: Changed from [String] to Mixed to accept objects
  findings: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sourceUrl: {
    type: String,
    default: null
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'extensions'
});

// Index for quick lookups
ExtensionSchema.index({ extensionId: 1, version: -1 });

module.exports = mongoose.model('Extension', ExtensionSchema);