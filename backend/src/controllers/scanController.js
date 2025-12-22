// src/controllers/scanController.js
const { fetchExtensionBuffer } = require('../services/fetchExtension');
const { analyzeExtension } = require('../services/analyzer');
const Extension = require('../models/Extension');

exports.scanExtension = async (req, res) => {
  try {
    const { extensionId, url } = req.body;
    if (!extensionId && !url) return res.status(400).json({ error: 'Provide extensionId or url' });

    const idOrUrl = extensionId || url;
    console.log('scanExtension: scanning', idOrUrl);

    // Fetch and get ZIP payload buffer
    const zipBuf = await fetchExtensionBuffer(idOrUrl);

    // Analyze (in-memory)
    const { manifest, files, score, findings } = await analyzeExtension(zipBuf);

    // Save to DB (non-blocking via await so demo shows persistence)
    const newExt = new Extension({
      extensionId: extensionId || manifest.key || manifest.name,
      name: manifest.name,
      manifest,
      score,
      findings
    });
    await newExt.save();

    // Drop large objects explicitly
    // (V8 will GC; this is just to help)
    // eslint-disable-next-line no-unused-vars
    zipBuf = null;

    res.json({ message: 'Scan complete', manifest, score, findings });
  } catch (err) {
    console.error('scanExtension error:', err);
    res.status(500).json({ error: err.message });
  }
};
