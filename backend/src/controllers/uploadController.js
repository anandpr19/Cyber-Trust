const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
const Extension = require("../models/Extension");
const { analyzePackage } = require("../utils/scanner");

const handleUpload = async (req, res) => {
  console.log("📥 Incoming upload request...");

  try {
    if (!req.file) {
      console.warn("⚠️ No file uploaded in request.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "../../uploads", req.file.filename);
    console.log("📦 Uploaded file path:", filePath);

    // Validate the file exists and is non-empty
    const stats = fs.statSync(filePath);
    if (!stats.size) {
      console.error("❌ Uploaded file is empty!");
      return res.status(400).json({ error: "Uploaded file is empty or corrupt" });
    }

    // Wait a bit to ensure file is fully flushed to disk (rare edge case)
    await new Promise((r) => setTimeout(r, 300));

    // Extract ZIP safely
    let zip;
    try {
      zip = new AdmZip(filePath);
    } catch (zipErr) {
      console.error("❌ Failed to open ZIP:", zipErr);
      return res.status(400).json({ error: "Invalid ZIP file format" });
    }

    const extractPath = path.join(__dirname, "../../temp", Date.now().toString());
    fs.mkdirSync(extractPath, { recursive: true });
    console.log("📂 Extracting to:", extractPath);

    try {
      zip.extractAllTo(extractPath, true);
    } catch (extractErr) {
      console.error("❌ ZIP extraction failed:", extractErr);
      return res.status(500).json({ error: "ZIP extraction failed" });
    }

    // Locate manifest.json (recursively if needed)
    let manifestPath = path.join(extractPath, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      // Try deep search
      const subdirs = fs.readdirSync(extractPath, { withFileTypes: true });
      for (const entry of subdirs) {
        if (entry.isDirectory()) {
          const maybe = path.join(extractPath, entry.name, "manifest.json");
          if (fs.existsSync(maybe)) {
            manifestPath = maybe;
            break;
          }
        }
      }
    }

    if (!fs.existsSync(manifestPath)) {
      console.error("❌ manifest.json not found");
      return res.status(400).json({ error: "manifest.json not found in zip" });
    }

    console.log("✅ Found manifest.json at:", manifestPath);
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    // Analyze manifest with scanner
    console.log("🔍 Analyzing manifest...");
    const { score, findings } = analyzePackage(manifestData, {});

    // Save to MongoDB
    const newExt = new Extension({
      extensionId: manifestData.key || manifestData.name + Date.now(),
      name: manifestData.name,
      manifest: manifestData,
      score,
      findings,
    });

    await newExt.save();
    console.log("💾 Saved to MongoDB:", newExt.name);

    // Respond with result
    res.json({
      message: "✅ Extension analyzed successfully",
      manifest: manifestData,
      score,
      findings,
    });

    // Optional cleanup (comment this out if you want to keep extracted zips)
    fs.rmSync(extractPath, { recursive: true, force: true });
    console.log("🧹 Temp folder cleaned up.");
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { handleUpload };
