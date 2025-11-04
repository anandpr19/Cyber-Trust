const { fetchExtensionBuffer } = require('../services/fetchExtension');
const { analyzeExtension } = require('../services/analyzer');
const Extension = require('../models/Extension');
const AdmZip = require('adm-zip');

exports.scanExtension = async (req, res) => {
  try {
    console.log('🔥 /api/scan triggered with body:', req.body);

    const { extensionId, url } = req.body;
    if (!extensionId && !url) {
      return res.status(400).json({ error: 'Provide extensionId or url' });
    }

    const idOrUrl = extensionId || url;

    // Step 1: Fetch CRX or ZIP as buffer
    const buffer = await fetchExtensionBuffer(idOrUrl);

    console.log('📦 Buffer received, length:', buffer.length);
    console.log('📂 Attempting to read manifest from ZIP...');

    // Step 2: Try to open as ZIP
    let zip;
    try {
      zip = new AdmZip(buffer);
    } catch (zipErr) {
      console.error('❌ ADM-ZIP failed:', zipErr.message);
      return res.status(400).json({ error: 'Invalid ZIP/CRX format. Could not extract contents.' });
    }

    // Step 3: Extract manifest.json
    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      return res.status(400).json({ error: 'manifest.json not found in archive' });
    }

    const manifestData = JSON.parse(zip.readAsText(manifestEntry));

    // Step 4: Analyze
    const { score, findings } = await analyzeExtension(buffer);

    // Step 5: Save to DB
    const newExt = new Extension({
      extensionId: idOrUrl,
      name: manifestData.name,
      manifest: manifestData,
      score,
      findings
    });

    await newExt.save();

    console.log('✅ Scan complete for', manifestData.name);
    res.json({
      message: 'Scan complete ✅',
      manifest: manifestData,
      score,
      findings
    });

  } catch (err) {
    console.error('💥 Scan error:', err);
    res.status(500).json({ error: err.message });
  }
};
