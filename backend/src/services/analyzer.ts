import AdmZip from 'adm-zip';
import { evaluatePolicies, PolicyEvaluationResult } from './policyEngine';

export interface AnalysisResult {
  manifest: Record<string, any>;
  files: Record<string, string>;
  score: number;
  findings: any[];
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

  console.log('🔐 Evaluating security policies...');
  const { score, findings } = evaluatePolicies(manifest, files);

  return {
    manifest,
    files,
    score,
    findings
  };
}