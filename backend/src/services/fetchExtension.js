// src/services/fetchExtension.js
const axios = require('axios');

const DEFAULT_CHROME_VER = process.env.CHROME_VERSION || '140.0.7339.81';
const MIRRORS = [
  (id) => `https://crx.dam.io/${id}.crx`,
  (id) => `https://chrome-extension-downloader.com/${id}.crx`
];

async function tryDownload(url, opts = {}) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', maxRedirects: 5, timeout: 20000, headers: opts.headers || {} , validateStatus: () => true});
    return { ok: true, res };
  } catch (err) {
    return { ok: false, err };
  }
}

/**
 * Fetch an extension by either a URL or extensionId.
 * Returns a Buffer containing the ZIP payload (ready for adm-zip).
 */
exports.fetchExtensionBuffer = async (input) => {
  // Input may be either a direct URL or an extensionId
  const isUrl = /^https?:\/\//i.test(input);
  const extId = isUrl ? null : input;
  const primaryUrl = isUrl ? input : `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=${DEFAULT_CHROME_VER}&x=id%3D${input}%26installsource%3Dondemand%26uc`;

  console.log('fetchExtensionBuffer: trying primary url:', primaryUrl);

  // Try primary
  let attempt = await tryDownload(primaryUrl, { headers: { 'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${DEFAULT_CHROME_VER} Safari/537.36`, 'Accept': 'application/octet-stream' } });
  let res = attempt.ok ? attempt.res : null;

  // If primary fails or returns empty, try mirrors
  if (!res || !res.data || Buffer.from(res.data).length < 100) {
    if (extId) {
      for (const m of MIRRORS) {
        const url = m(extId);
        console.log('fetchExtensionBuffer: trying mirror:', url);
        attempt = await tryDownload(url);
        if (attempt.ok && attempt.res && attempt.res.data && Buffer.from(attempt.res.data).length > 100) {
          res = attempt.res;
          break;
        }
      }
    }
  }

  if (!res || !res.data || Buffer.from(res.data).length < 100) {
    throw new Error('Failed to download CRX/ZIP from primary + mirrors');
  }

  let buf = Buffer.from(res.data);
  console.log('fetchExtensionBuffer: downloaded bytes:', buf.length);

  // Detect CRX header (magic "Cr24")
  if (buf.length >= 4 && buf.slice(0, 4).toString('ascii') === 'Cr24') {
    // CRX header parsing (supports v2 and v3-ish)
    // For v2: bytes 4..7 = version, 8..11 = pubkeyLen, 12..15 = sigLen, header = 16 + pubkeyLen + sigLen
    // For v3: some variants use a 12 byte header; fallback by searching for PK signature if needed
    try {
      const version = buf.readUInt32LE(4);
      let headerSize;
      if (version === 2) {
        const pubKeyLength = buf.readUInt32LE(8);
        const sigLength = buf.readUInt32LE(12);
        headerSize = 16 + pubKeyLength + sigLength;
      } else if (version >= 3) {
        // CRX v3 header layout can vary; attempt to use v3 layout
        const pubKeyLength = buf.readUInt32LE(8);
        headerSize = 12 + pubKeyLength; // common fallback
      } else {
        headerSize = 16; // fallback
      }

      // safety: find ZIP magic "PK\x03\x04" if headerSize seems wrong
      const pkIndex = buf.indexOf(Buffer.from('504b0304', 'hex'));
      if (pkIndex !== -1 && pkIndex > headerSize + 4) {
        console.warn('fetchExtensionBuffer: zip signature located at different offset, using pkIndex', pkIndex);
        headerSize = pkIndex;
      }

      console.log('fetchExtensionBuffer: crx headerSize=', headerSize);
      const zipBuf = buf.slice(headerSize);
      if (zipBuf.length < 100) throw new Error('ZIP payload length suspiciously small after CRX header trim');
      return zipBuf;
    } catch (err) {
      // If header parsing fails, try to find ZIP signature
      const zipIdx = buf.indexOf(Buffer.from('504b0304', 'hex'));
      if (zipIdx !== -1) {
        const zipBuf = buf.slice(zipIdx);
        if (zipBuf.length > 100) return zipBuf;
      }
      throw new Error('CRX header parsing failed: ' + (err.message || err));
    }
  } else {
    // Not CRX; assume it's a ZIP or already the payload
    const zipIdx = buf.indexOf(Buffer.from('504b0304', 'hex'));
    if (zipIdx !== -1) {
      const zipBuf = buf.slice(zipIdx);
      if (zipBuf.length > 100) return zipBuf;
    }
    // else it might be a zipped response body already (some mirrors return zip directly)
    if (buf.length > 100) return buf;
    throw new Error('Downloaded content is not CRX or ZIP');
  }
};
