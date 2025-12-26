const { fetchExtensionCRX, extractExtensionId } = require('../services/fetchExtension');
const { analyzeBufferZip } = require('../services/analyzer');

/**
 * Convert CRX buffer to ZIP buffer (same as uploadController)
 */
function crxToZipBuffer(buf) {
  try {
    if (buf.length >= 4) {
      const header = buf.slice(0, 4).toString('ascii');

      if (header === 'Cr24') {
        console.log('✅ Detected CRX format');

        if (buf.length >= 16) {
          const version = buf.readUInt32LE(4);
          console.log('📦 CRX Version:', version);

          let headerSize = 16;

          if (version === 2) {
            const pubKeyLength = buf.readUInt32LE(8);
            const sigLength = buf.readUInt32LE(12);
            headerSize = 16 + pubKeyLength + sigLength;
          } else if (version === 3) {
            const pubKeyLength = buf.readUInt32LE(8);
            headerSize = 12 + pubKeyLength;
          }

          const pkMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
          const zipIndex = buf.indexOf(pkMagic);

          if (zipIndex !== -1 && zipIndex < buf.length - 100) {
            console.log(`🔍 ZIP found at offset: ${zipIndex}`);
            headerSize = zipIndex;
          }

          const zipBuf = buf.slice(headerSize);

          if (zipBuf.length < 100) {
            throw new Error('ZIP payload is too small');
          }

          console.log(`✂️  Stripped ${headerSize} bytes, ZIP size: ${zipBuf.length}`);
          return zipBuf;
        }
      }
    }

    const pkMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    const zipIndex = buf.indexOf(pkMagic);

    if (zipIndex !== -1) {
      const zipBuf = buf.slice(zipIndex);
      console.log(`✅ ZIP format detected`);
      return zipBuf;
    }

    throw new Error('File is not a valid CRX or ZIP');
  } catch (err) {
    throw new Error(`CRX conversion failed: ${err.message}`);
  }
}

/**
 * Handle scan request by Extension ID or URL
 * POST /api/scan
 * 
 * Body:
 * {
 *   "extensionId": "abcdef123456..." OR
 *   "url": "https://chromewebstore.google.com/detail/name/abcdef123456..."
 * }
 */
exports.scanExtension = async (req, res) => {
  let crxBuffer = null;
  let zipBuffer = null;

  try {
    // Step 1: Get input
    const { extensionId, url } = req.body;

    if (!extensionId && !url) {
      return res.status(400).json({
        error: 'Missing input',
        message: 'Provide either "extensionId" or "url"',
        example: {
          extensionId: 'abcdef123456789...',
          url: 'https://chromewebstore.google.com/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb'
        }
      });
    }

    const input = extensionId || url;

    // Step 2: Fetch CRX from Google or mirrors
    console.log(`\n📥 Scan request: ${input}`);
    
    try {
      crxBuffer = await fetchExtensionCRX(input);
    } catch (err) {
      return res.status(400).json({
        error: 'Failed to download extension',
        message: err.message,
        hint: 'Make sure the Extension ID or URL is correct. Check the Chrome Web Store URL.'
      });
    }

    // Step 3: Convert CRX to ZIP
    console.log('🔄 Converting CRX to ZIP...');
    try {
      zipBuffer = crxToZipBuffer(crxBuffer);
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid extension format',
        message: err.message
      });
    }

    // Step 4: Analyze
    console.log('🔍 Starting analysis...');
    const analysis = await analyzeBufferZip(zipBuffer);

    console.log(`✅ Analysis complete. Score: ${analysis.score}`);

    // Step 5: Save to database
    let saved = false;
    let dbError = null;

    try {
      const Extension = require('../models/Extension');
      const parsedId = extractExtensionId(input);

      const ext = new Extension({
        extensionId: parsedId,
        name: analysis.manifest.name || 'Unknown',
        version: analysis.manifest.version || 'unknown',
        manifest: analysis.manifest,
        score: analysis.score,
        findings: analysis.findings,
        sourceUrl: url || null
      });

      await ext.save();
      console.log('💾 Saved to database');
      saved = true;
    } catch (dbErr) {
      console.warn('⚠️ Database save failed:', dbErr.message);
      dbError = dbErr.message;
    }

    // Step 6: Return results
    res.status(200).json({
      success: true,
      extensionId: extractExtensionId(input),
      name: analysis.manifest.name || 'Unknown',
      version: analysis.manifest.version || 'unknown',
      manifest: analysis.manifest,
      score: analysis.score,
      findings: analysis.findings,
      crxSize: crxBuffer.length,
      zipSize: zipBuffer.length,
      savedToDb: saved,
      dbError: dbError || undefined,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Scan error:', err.message);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Analysis failed',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
  } finally {
    // Cleanup
    try {
      // Let garbage collector handle it
      // Don't reassign const variables
    } catch (e) {
      // Ignore
    }
  }
};