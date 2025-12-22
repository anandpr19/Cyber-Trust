const AdmZip = require('adm-zip');
const { evaluatePolicies } = require('./policyEngine');

exports.analyzeBufferZip = async (zipBuffer) => {
  let zip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch (err) {
    throw new Error('ADM-ZIP: ' + err.message);
  }

  const entries = zip.getEntries();
  const files = {};
  let manifest = null;

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    try {
      const name = entry.entryName;
      const text = zip.readAsText(entry);
      files[name] = text;
      if (name === 'manifest.json' || name.endsWith('/manifest.json')) {
        manifest = JSON.parse(text);
      }
    } catch (e) {
      // ignore binary entries
    }
  }

  if (!manifest) throw new Error('manifest.json not found');

  const { score, findings } = evaluatePolicies(manifest, files);
  return { manifest, files, score, findings };
};
