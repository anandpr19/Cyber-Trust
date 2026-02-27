import AdmZip from 'adm-zip';
import { evaluatePolicies, PolicyEvaluationResult } from './policyEngine';

export interface AnalysisResult {
  manifest: Record<string, any>;
  files: Record<string, string>;
  score: number;
  findings: any[];
  embeddedUrls: string[];
}

// URLs to filter out as false positives (standard/expected)
const URL_FILTER_PATTERNS = [
  'chromium.org',
  'w3.org',
  'www.w3.org',
  'schema.org',
  'googleapis.com/css',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'developer.mozilla.org',
  'developer.chrome.com',
  'chrome.google.com/webstore',
  'creativecommons.org',
  'spdx.org',
  'opensource.org',
  'github.com/nicedoc',
  'webpack.js.org',
  'babeljs.io',
  'reactjs.org',
  'nodejs.org',
  'npmjs.org',
  'unpkg.com',
  'cdnjs.cloudflare.com',
];

const URL_REGEX = /https?:\/\/[^\s'"<>)\]},;]+/g;

function extractUrlsFromFiles(files: Record<string, string>): string[] {
  const urlSet = new Set<string>();

  Object.entries(files).forEach(([filename, content]) => {
    // Skip binary files and non-code files
    if (!filename.match(/\.(js|html|json|css|ts|jsx|tsx|mjs|cjs)$/i)) return;

    const matches = content.match(URL_REGEX);
    if (matches) {
      matches.forEach((url) => {
        // Clean trailing punctuation
        let cleaned = url.replace(/[.,;:!?)}\]]+$/, '');

        // Filter out standard/expected URLs
        const isFiltered = URL_FILTER_PATTERNS.some(pattern =>
          cleaned.toLowerCase().includes(pattern)
        );

        if (!isFiltered && cleaned.length > 10) {
          urlSet.add(cleaned);
        }
      });
    }
  });

  return Array.from(urlSet).sort();
}

export async function analyzeBufferZip(zipBuffer: Buffer): Promise<AnalysisResult> {
  console.log('📦 Extracting ZIP...');

  let zip: AdmZip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch (err) {
    throw new Error(`Failed to parse ZIP: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  const entries = zip.getEntries();
  console.log(`📂 Found ${entries.length} files in archive`);

  const files: Record<string, string> = {};
  let manifest: Record<string, any> | null = null;

  // Extract files
  for (const entry of entries) {
    try {
      if (entry.isDirectory) continue;

      const name = entry.entryName;

      try {
        const text = zip.readAsText(entry);
        files[name] = text;

        if (name === 'manifest.json' || name.endsWith('/manifest.json')) {
          manifest = JSON.parse(text);
          if (manifest) {
            console.log(`✅ Found manifest: ${manifest.name || 'unknown'}`);
          }
        }
      } catch (textErr) {
        // Binary file - skip
        if (!name.endsWith('.png') && !name.endsWith('.jpg') && !name.endsWith('.woff')) {
          console.log(`⊘ Could not read as text: ${name}`);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Error processing entry:`, err instanceof Error ? err.message : 'Unknown');
    }
  }

  if (!manifest) {
    throw new Error('manifest.json not found in extension');
  }

  // Extract embedded URLs from all files
  console.log('🔗 Extracting embedded URLs...');
  const embeddedUrls = extractUrlsFromFiles(files);
  console.log(`  Found ${embeddedUrls.length} unique URLs`);

  console.log('🔐 Evaluating security policies...');
  const { score, findings } = evaluatePolicies(manifest, files);

  return {
    manifest,
    files,
    score,
    findings,
    embeddedUrls
  };
}