const AdmZip = require('adm-zip');
const { evaluatePolicies } = require('./policyEngine');

/**
 * Extract and analyze a ZIP buffer containing extension files
 */
async function analyzeBufferZip(zipBuffer) {
  console.log('📦 Extracting ZIP...');
  
  let zip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch (err) {
    throw new Error(`Failed to parse ZIP: ${err.message}`);
  }

  const entries = zip.getEntries();
  console.log(`📂 Found ${entries.length} files in archive`);

  const files = {};
  let manifest = null;

  // Extract all text files
  for (const entry of entries) {
    try {
      if (entry.isDirectory) continue;

      const name = entry.entryName;

      // Try to read as text
      try {
        const text = zip.readAsText(entry);
        files[name] = text;

        // Capture manifest
        if (name === 'manifest.json' || name.endsWith('/manifest.json')) {
          manifest = JSON.parse(text);
          console.log(`✅ Found manifest: ${manifest.name || 'unknown'}`);
        }
      } catch (textErr) {
        // Binary file - skip silently
        if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.woff')) {
          // Expected binary files
        } else {
          console.log(`⊘ Could not read as text: ${name}`);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Error processing entry ${entry.entryName}:`, err.message);
    }
  }

  // Validate manifest exists
  if (!manifest) {
    throw new Error('manifest.json not found in extension');
  }

  // Run policy evaluation
  console.log('🔐 Evaluating security policies...');
  const { score, findings } = evaluatePolicies(manifest, files);

  return {
    manifest,
    files,
    score,
    findings
  };
}

module.exports = {
  analyzeBufferZip
};