// src/controllers/scanController.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crxToZip = require("../utils/crxToZip");

const tryDownload = async (urls, outputPath) => {
  for (const url of urls) {
    try {
      console.log(`🌐 Trying ${url}`);
      const response = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
      if (response.data && response.data.byteLength > 0) {
        fs.writeFileSync(outputPath, response.data);
        console.log(`✅ Downloaded successfully from ${url}`);
        return true;
      }
    } catch (err) {
      console.log(`❌ Failed from ${url}`);
    }
  }
  return false;
};

const scanByUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    const match = url.match(/detail\/.*\/([a-p]{32})/);
    if (!match) return res.status(400).json({ error: "Invalid Chrome Web Store URL" });

    const extensionId = match[1];
    const downloadDir = "downloads";
    fs.mkdirSync(downloadDir, { recursive: true });

    const crxPath = path.join(downloadDir, `${extensionId}.crx`);

    // Skip if already downloaded
    if (!fs.existsSync(crxPath) || fs.statSync(crxPath).size === 0) {
      console.log(`⬇️ Downloading CRX for ${extensionId}...`);

      const mirrors = [
        `https://crx.dam.io/${extensionId}.crx`,
        `https://chrome-extension-downloader.com/${extensionId}.crx`,
        `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=140.0.7339.81&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`
      ];

      const success = await tryDownload(mirrors, crxPath);

      if (!success) {
        throw new Error("Could not download CRX from any mirror");
      }
    } else {
      console.log(`📦 Found existing CRX: ${crxPath}`);
    }

    // Convert CRX → ZIP → Extract manifest
    let zipBuffer;
    try {
      zipBuffer = crxToZip(crxPath);
    } catch (err) {
      console.warn("⚠️ CRX parse failed, trying fallback ZIP signature...");
      const raw = fs.readFileSync(crxPath);
      const zipIndex = raw.indexOf(Buffer.from("504B0304", "hex"));
      if (zipIndex !== -1) {
        zipBuffer = raw.slice(zipIndex);
      } else {
        throw new Error("Could not find ZIP data in CRX");
      }
    }

    const manifestMatch = zipBuffer.toString().match(/"manifest_version".*}/s);
    const report = {
      extensionId,
      result: manifestMatch ? "manifest.json found" : "manifest.json not found",
      manifest: manifestMatch ? manifestMatch[0] : null,
      score: manifestMatch ? 80 : 40,
      message: "Extension scanned successfully",
    };

    res.json(report);
  } catch (err) {
    console.error("scanByUrl error:", err);
    res.status(500).json({ error: "Failed to scan extension", details: err.message });
  }
};

const getCached = async (req, res) => {
  res.json({ message: "Cache lookup not implemented yet." });
};

module.exports = { scanByUrl, getCached };
