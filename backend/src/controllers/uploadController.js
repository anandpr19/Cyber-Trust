const AdmZip = require('adm-zip');
const { analyzeBufferZip } = require('../services/analyzer');
const Extension = require('../models/Extension'); // simple mongoose model if you have mongo

// Helper: convert CRX Buffer -> ZIP Buffer (trim header)
function crxToZipBuffer(buf) {
  if (buf.slice(0,4).toString('ascii') === 'Cr24') {
    const version = buf.readUInt32LE(4);
    let headerSize;
    if (version === 2) {
      const pubKeyLength = buf.readUInt32LE(8);
      const sigLength = buf.readUInt32LE(12);
      headerSize = 16 + pubKeyLength + sigLength;
    } else {
      const pubKeyLength = buf.readUInt32LE(8);
      headerSize = 12 + pubKeyLength;
    }
    const pkIndex = buf.indexOf(Buffer.from('504b0304','hex'));
    if (pkIndex !== -1 && pkIndex > headerSize) headerSize = pkIndex;
    return buf.slice(headerSize);
  }
  // try to detect ZIP signature
  const zipIdx = buf.indexOf(Buffer.from('504b0304','hex'));
  if (zipIdx !== -1) return buf.slice(zipIdx);
  throw new Error('Not a CRX/ZIP');
}

exports.handleUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const extId = req.body.extensionId || 'unknown';
    const buf = req.file.buffer;
    if (!buf || buf.length < 10) return res.status(400).json({ error: 'Empty file' });

    // Convert CRX -> ZIP payload if needed
    let zipBuf;
    try {
      zipBuf = crxToZipBuffer(buf);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid CRX/ZIP file', details: err.message });
    }

    // Analyze ZIP buffer
    const { manifest, files, score, findings } = await analyzeBufferZip(zipBuf);

    // Save metadata (if you use Mongo, Extension model should be defined)
    // Optional: You can comment this out if Mongo isn't set up
    try {
      const ext = new Extension({
        extensionId: extId,
        name: manifest.name || extId,
        manifest,
        score,
        findings,
        createdAt: new Date()
      });
      await ext.save();
    } catch (e) {
      console.warn('Mongo save skipped/failed:', e.message);
    }

    // Drop buffers (help GC)
    // (no disk writes)
    res.json({ status: 'ok', extensionId: extId, manifest, score, findings });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};