const AdmZip = require('adm-zip');
const { evaluatePolicies } = require('./policyEngine');
exports.analyzeExtension = async (buffer) => {
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();

  const files = {};
  let manifest = null;

  zipEntries.forEach(entry => {
    if (entry.entryName.endsWith('manifest.json')) {
      manifest = JSON.parse(entry.getData().toString('utf8'));
    } else {
      files[entry.entryName] = entry.getData().toString('utf8');
    }
  });

  if (!manifest) throw new Error('manifest.json not found in archive');

  const { score, findings } = evaluatePolicies(manifest, files);
  return { manifest, score, findings };
};
