import { Request, Response } from 'express';
import { fetchExtensionCRX, extractExtensionId } from '../services/fetchExtension';
import { analyzeBufferZip } from '../services/analyzer';
import { formatFindingsForUsers } from '../services/findingsFormatter';
import { scrapeStoreMetadata } from '../services/chromeStoreScraper';
import { analyzeWithAI } from '../services/aiAnalyzer';
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
    throw new Error(`CRX conversion failed: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}

export const scanExtension = async (req: Request, res: Response): Promise<void> => {
  let crxBuffer: Buffer | null = null;
  let zipBuffer: Buffer | null = null;

  try {
    const { extensionId, url, force } = req.body;

    if (!extensionId && !url) {
      res.status(400).json({
        error: 'Missing input',
        message: 'Provide either "extensionId" or "url"',
        example: {
          extensionId: 'abcdef123456789...',
          url: 'https://chromewebstore.google.com/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb'
        }
      });
      return;
    }

    const input = extensionId || url;
    const parsedId = extractExtensionId(input);

    console.log(`\n📥 Scan request: ${input} (ID: ${parsedId})`);

    // ── Scan Caching: Check for recent result ──
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const cachedResult = await Extension.findOne({
        extensionId: parsedId,
        scannedAt: { $gte: twentyFourHoursAgo }
      }).sort({ scannedAt: -1 });

      if (cachedResult && force !== 'true' && force !== true) {
        console.log('📦 Returning cached result (scanned within 24 hours)');
        res.status(200).json({
          success: true,
          cached: true,
          extensionId: cachedResult.extensionId,
          name: cachedResult.name,
          version: cachedResult.version,
          report: formatFindingsForUsers(cachedResult.findings, cachedResult.score),
          rawData: {
            manifest: cachedResult.manifest,
            score: cachedResult.score,
            findings: cachedResult.findings,
            embeddedUrls: (cachedResult as any).embeddedUrls || [],
          },
          storeMetadata: (cachedResult as any).storeMetadata || null,
          aiAnalysis: (cachedResult as any).aiAnalysis || null,
          savedToDb: true,
          lastScanned: cachedResult.scannedAt,
          timestamp: new Date().toISOString()
        });
        return;
      }
    } catch (cacheErr) {
      console.warn('⚠️ Cache check failed, proceeding with fresh analysis');
    }

    // ── Scrape Chrome Web Store metadata ──
    const storeMetadata = await scrapeStoreMetadata(parsedId);

    // ── Download CRX ──
    try {
      crxBuffer = await fetchExtensionCRX(input);
    } catch (err) {
      res.status(400).json({
        error: 'Failed to download extension',
        message: err instanceof Error ? err.message : 'Unknown error',
        hint: 'Make sure the Extension ID or URL is correct.'
      });
      return;
    }

    console.log('🔄 Converting CRX to ZIP...');
    try {
      zipBuffer = crxToZipBuffer(crxBuffer);
    } catch (err) {
      res.status(400).json({
        error: 'Invalid extension format',
        message: err instanceof Error ? err.message : 'Unknown error'
      });
      return;
    }

    console.log('🔍 Starting analysis...');
    const analysis = await analyzeBufferZip(zipBuffer);
    console.log(`✅ Analysis complete. Score: ${analysis.score}`);

    // ── AI Analysis ──
    const extensionName = storeMetadata?.name || analysis.manifest.name || 'Unknown';
    const aiAnalysis = await analyzeWithAI(
      analysis.manifest,
      analysis.findings,
      storeMetadata,
      extensionName
    );

    // ── Format findings for frontend ──
    const userFriendlyReport = formatFindingsForUsers(analysis.findings, analysis.score);

    // ── Save to database ──
    let saved = false;
    let dbError: string | null = null;

    try {
      const ext = new Extension({
        extensionId: parsedId,
        name: extensionName,
        version: analysis.manifest.version || 'unknown',
        manifest: analysis.manifest,
        score: analysis.score,
        findings: analysis.findings,
        embeddedUrls: analysis.embeddedUrls,
        storeMetadata: storeMetadata || undefined,
        aiAnalysis: aiAnalysis || undefined,
        sourceUrl: url || null
      });

      await ext.save();
      console.log('💾 Saved to database');
      saved = true;
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : 'Unknown error';
      console.warn('⚠️ Database save failed:', msg);
      dbError = msg;
    }

    res.status(200).json({
      success: true,
      cached: false,
      extensionId: parsedId,
      name: extensionName,
      version: analysis.manifest.version || 'unknown',
      report: userFriendlyReport,
      rawData: {
        manifest: analysis.manifest,
        score: analysis.score,
        findings: analysis.findings,
        crxSize: crxBuffer.length,
        zipSize: zipBuffer.length,
        embeddedUrls: analysis.embeddedUrls,
      },
      storeMetadata: storeMetadata || null,
      aiAnalysis: aiAnalysis || null,
      savedToDb: saved,
      dbError: dbError || undefined,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Scan error:', err instanceof Error ? err.message : 'Unknown');

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Analysis failed',
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
};