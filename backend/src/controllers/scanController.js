// src/controllers/scanController.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Extension = require("../models/Extension");
const { analyzePackage } = require("../utils/scanner");

const scanByUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    const match = url.match(/detail\/.*\/([a-p]{32})/);
    if (!match) return res.status(400).json({ error: "Invalid Chrome Web Store URL" });
    const extensionId = match[1];

    // 🔍 Check DB cache
    let existing = await Extension.findOne({ extensionId });
    if (existing) {
      console.log(`📦 Using cached scan for ${extensionId}`);
      return res.json(existing);
    }

    // ⚠️ Skip CRX download for now (handled later by ZIP upload)
    console.log(`🚫 Skipping CRX download — waiting for ZIP integration.`);

    // Stub manifest (mock)
    const manifest = {
      name: "Unknown (ZIP not yet parsed)",
      version: "N/A",
      permissions: ["tabs", "storage"]
    };

    // Analyze using scanner.js
    const { score, findings } = analyzePackage(manifest, {});

    // Save to Mongo
    const newExt = new Extension({
      extensionId,
      manifest,
      score,
      findings
    });

    await newExt.save();

    res.json({
      extensionId,
      score,
      findings,
      message: "Scanned successfully (mocked, ZIP integration next)"
    });

  } catch (err) {
    console.error("scanByUrl error:", err);
    res.status(500).json({ error: "Failed to scan extension", details: err.message });
  }
};

const getCached = async (req, res) => {
  try {
    const { id } = req.params;
    const ext = await Extension.findOne({ extensionId: id });
    if (!ext) return res.status(404).json({ message: "No record found" });
    res.json(ext);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { scanByUrl, getCached };
