import { Request, Response } from 'express';
import { analyzeBufferZip } from '../services/analyzer';
import { formatFindingsForUsers } from '../services/findingsFormatter';
import Extension from '../models/Extension';

function crxToZipBuffer(buf: Buffer): Buffer {
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
            throw new Error('ZIP payload is too small after header removal');
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
    throw new Error(`CRX conversion failed: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}

export const handleUpload = async (req: Request, res: Response): Promise<void> => {
  let zipBuf: Buffer | null = null;
  let buf: Buffer | null = null;

  try {
    if (!req.file) {
      res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a .crx file'
      });
      return;
    }

    buf = req.file.buffer;
    const extensionId = req.body.extensionId || req.file.originalname.replace('.crx', '') || 'unknown';

    console.log(`\n📤 Upload request: ${extensionId} (${buf.length} bytes)`);

    if (buf.length < 100) {
      res.status(400).json({
        error: 'File too small',
        message: 'The uploaded file appears to be corrupt'
      });
      return;
    }

    if (buf.length > 50 * 1024 * 1024) {
      res.status(413).json({
        error: 'File too large',
        message: 'Maximum file size is 50MB'
      });
      return;
    }

    try {
      zipBuf = crxToZipBuffer(buf);
    } catch (err) {
      res.status(400).json({
        error: 'Invalid file format',
        message: err instanceof Error ? err.message : 'Unknown error',
        hint: 'Please upload a valid Chrome extension (.crx) file'
      });
      return;
    }

    console.log('🔍 Starting analysis...');
    const analysis = await analyzeBufferZip(zipBuf);

    console.log(`✅ Analysis complete. Score: ${analysis.score}`);

    //Format findings for frontend
    const userFriendlyReport = formatFindingsForUsers(analysis.findings, analysis.score);

    let saved = false;
    let dbError: string | null = null;

    try {
      const ext = new Extension({
        extensionId,
        name: analysis.manifest.name || extensionId,
        version: analysis.manifest.version || 'unknown',
        manifest: analysis.manifest,
        score: analysis.score,
        findings: analysis.findings,
        sourceUrl: req.body.sourceUrl || null
      });

      await ext.save();
      console.log('💾 Saved to database');
      saved = true;
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : 'Unknown error';
      console.warn('⚠️ Database save failed:', msg);
      dbError = msg;
    }

    // Return both raw findings (for reference) and user-friendly report
    res.status(200).json({
      success: true,
      extensionId,
      name: analysis.manifest.name || extensionId,
      version: analysis.manifest.version || 'unknown',
      
      // User-friendly report 
      report: userFriendlyReport,
      
      //raw data for reference
      rawData: {
        manifest: analysis.manifest,
        score: analysis.score,
        findings: analysis.findings,
        fileSize: buf.length,
        zipSize: zipBuf.length
      },
      
      savedToDb: saved,
      dbError: dbError || undefined,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Upload error:', err instanceof Error ? err.message : 'Unknown');

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Analysis failed',
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
};