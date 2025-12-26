const { analyzeBufferZip } = require('../services/analyzer');

/**
 * Convert CRX file buffer to ZIP buffer
 * CRX files have a header that needs to be stripped
 */
function crxToZipBuffer(buf) {
  try {
    // Check for CRX magic header "Cr24"
    if (buf.length >= 4) {
      const header = buf.slice(0, 4).toString('ascii');

      if (header === 'Cr24') {
        console.log('✅ Detected CRX format');

        // CRX v2 format
        if (buf.length >= 16) {
          const version = buf.readUInt32LE(4);
          console.log('📦 CRX Version:', version);

          let headerSize = 16;

          if (version === 2) {
            const pubKeyLength = buf.readUInt32LE(8);
            const sigLength = buf.readUInt32LE(12);
            headerSize = 16 + pubKeyLength + sigLength;
            console.log(`📏 Header size (v2): ${headerSize} bytes`);
          } else if (version === 3) {
            const pubKeyLength = buf.readUInt32LE(8);
            headerSize = 12 + pubKeyLength;
            console.log(`📏 Header size (v3): ${headerSize} bytes`);
          }

          // Find ZIP magic bytes "PK\x03\x04" as fallback
          const pkMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
          const zipIndex = buf.indexOf(pkMagic);

          if (zipIndex !== -1 && zipIndex < buf.length - 100) {
            console.log(`🔍 ZIP found at offset: ${zipIndex}`);
            headerSize = zipIndex;
          }

          const zipBuf = buf.slice(headerSize);

          if (zipBuf.length < 100) {
            throw new Error('ZIP payload is too small after header removal');
          }

          console.log(`✂️  Stripped ${headerSize} bytes, ZIP size: ${zipBuf.length}`);
          return zipBuf;
        }
      }
    }

    // Try to find ZIP directly if no CRX header
    const pkMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    const zipIndex = buf.indexOf(pkMagic);

    if (zipIndex !== -1) {
      const zipBuf = buf.slice(zipIndex);
      console.log(`✅ Direct ZIP format detected at offset ${zipIndex}`);
      return zipBuf;
    }

    throw new Error('File is not a valid CRX or ZIP');
  } catch (err) {
    throw new Error(`CRX conversion failed: ${err.message}`);
  }
}

/**
 * Handle extension upload and analysis
 * POST /api/upload
 */
exports.handleUpload = async (req, res) => {
  let zipBuf = null;
  let buf = null;

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a .crx file'
      });
    }

    buf = req.file.buffer;
    const extensionId = req.body.extensionId || req.file.originalname.replace('.crx', '') || 'unknown';

    console.log(`\n📤 Upload request: ${extensionId} (${buf.length} bytes)`);

    // Validate file size
    if (buf.length < 100) {
      return res.status(400).json({
        error: 'File too small',
        message: 'The uploaded file appears to be corrupt'
      });
    }

    if (buf.length > 50 * 1024 * 1024) {
      return res.status(413).json({
        error: 'File too large',
        message: 'Maximum file size is 50MB'
      });
    }

    // Convert CRX to ZIP
    try {
      zipBuf = crxToZipBuffer(buf);
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid file format',
        message: err.message,
        hint: 'Please upload a valid Chrome extension (.crx) file'
      });
    }

    // Analyze the ZIP buffer
    console.log('🔍 Starting analysis...');
    const analysis = await analyzeBufferZip(zipBuf);

    console.log(`✅ Analysis complete. Score: ${analysis.score}`);

    // Try to save to database if available
    let saved = false;
    let dbError = null;

    try {
      const Extension = require('../models/Extension');
      const ext = new Extension({
        extensionId,
        name: analysis.manifest.name || extensionId,
        version: analysis.manifest.version || 'unknown',
        manifest: analysis.manifest,
        score: analysis.score,
        findings: analysis.findings, // Now accepts objects
        sourceUrl: req.body.sourceUrl || null
      });

      await ext.save();
      console.log('💾 Saved to database');
      saved = true;
    } catch (dbErr) {
      console.warn('⚠️ Database save failed:', dbErr.message);
      dbError = dbErr.message;
      // Continue anyway - we can still return the analysis
    }

    // Return analysis results
    res.status(200).json({
      success: true,
      extensionId,
      name: analysis.manifest.name || extensionId,
      version: analysis.manifest.version || 'unknown',
      manifest: analysis.manifest,
      score: analysis.score,
      findings: analysis.findings,
      fileSize: buf.length,
      zipSize: zipBuf.length,
      savedToDb: saved,
      dbError: dbError ? dbError : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Upload error:', err.message);
    // Make sure we don't send response if already sent
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Analysis failed',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
  } finally {
    // Clean up buffers (help garbage collection)
    // Using try-catch to avoid "cannot assign to const" error
    try {
      if (zipBuf) {
        // Just let garbage collector handle it
        // Don't try to reassign
      }
      if (buf) {
        // Just let garbage collector handle it
      }
    } catch (e) {
      // Silently ignore cleanup errors
    }
  }
};