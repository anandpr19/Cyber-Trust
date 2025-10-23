// src/models/Extension.js
const mongoose = require('mongoose');

const ExtensionSchema = new mongoose.Schema({
  extensionId: { type: String, required: true, index: true },
  name: { type: String },
  version: { type: String },
  manifest: { type: Object },
  permissions: { type: [String], default: [] },
  findings: { type: [String], default: [] },
  score: { type: Number, default: null },
  scannedAt: { type: Date, default: Date.now },
  sourceUrl: { type: String }, // original webstore url
}, { timestamps: true });

// optional compound index to quickly get latest by extensionId + version
ExtensionSchema.index({ extensionId: 1, version: 1 }, { unique: false });

module.exports = mongoose.model('Extension', ExtensionSchema);
