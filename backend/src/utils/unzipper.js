const AdmZip = require('adm-zip');

function unzipBufferToMap(zipBuffer) {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  const map = {};
  entries.forEach(entry => {
    if (!entry.isDirectory) {
      const name = entry.entryName;
      // read as buffer (text/binary)
      const data = entry.getData();
      map[name] = data; // Buffer
    }
  });
  return map;
}

module.exports = { unzipBufferToMap };
