// background.js (MV3 service worker)
const DEFAULT_CHROME_VER = (() => {
  try {
    const m = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
    if (!m) return "140.0.7339.81";
    return `${m[1]}.${m[2]}.${m[3]}.${m[4]}`;
  } catch (e) {
    return "140.0.7339.81";
  }
})();

function getNaclArch() {
  if (navigator.userAgent.indexOf('x86') > 0) return 'x86-32';
  if (navigator.userAgent.indexOf('x64') > 0) return 'x86-64';
  return 'arm';
}

async function fetchCrxById(extId) {
  // Build update2 URL similar to CRX extractor
  const nacl_arch = getNaclArch();
  const url = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=${DEFAULT_CHROME_VER}&x=id%3D${extId}%26installsource%3Dondemand%26uc&nacl_arch=${nacl_arch}&acceptformat=crx2,crx3`;
  console.log('[ext] fetching CRX URL:', url);

  const res = await fetch(url, { credentials: 'include' }); // extension context includes cookies/certs
  if (!res.ok) throw new Error('CRX fetch failed: ' + res.status);
  const arr = await res.arrayBuffer();
  return new Uint8Array(arr);
}

// background message handler from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === 'scanById') {
    (async () => {
      try {
        const extId = msg.extId;
        chrome.action.setBadgeText({ text: '...' });
        const crxUint8 = await fetchCrxById(extId);

        // Build a Blob (send as file)
        const blob = new Blob([crxUint8], { type: 'application/octet-stream' });

        // Upload to backend (multipart/form-data)
        const form = new FormData();
        form.append('extensionId', extId);
        form.append('file', blob, `${extId}.crx`);

        // NOTE: use your backend URL
        const backendUrl = msg.backendUrl || 'http://localhost:4000/api/scan/upload';

        const uploadRes = await fetch(backendUrl, {
          method: 'POST',
          body: form
        });

        const json = await uploadRes.json();
        chrome.action.setBadgeText({ text: '' });
        sendResponse({ success: true, result: json });
      } catch (err) {
        console.error('[ext] scan error', err);
        chrome.action.setBadgeText({ text: '!' });
        sendResponse({ success: false, error: err.message || String(err) });
      }
    })();

    // Indicate we'll respond asynchronously
    return true;
  }
});
