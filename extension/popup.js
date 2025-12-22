document.getElementById('scan').addEventListener('click', async () => {
  const v = document.getElementById('ext').value.trim();
  if (!v) { document.getElementById('status').innerText = 'Enter extension URL or ID'; return; }

  // derive extId if it's a URL
  const id = (v.match(/([a-p0-9]{32})$/) || [])[0] || v; // basic extraction
  document.getElementById('status').innerText = 'Starting scan...';
  document.getElementById('result').innerText = '';

  chrome.runtime.sendMessage({ action: 'scanById', extId: id, backendUrl: 'http://localhost:4000/api/scan/upload' }, (resp) => {
    if (!resp) {
      document.getElementById('status').innerText = 'No response from extension (check service worker).';
      return;
    }
    if (resp.success) {
      document.getElementById('status').innerText = 'Scan complete';
      document.getElementById('result').innerText = JSON.stringify(resp.result, null, 2);
    } else {
      document.getElementById('status').innerText = 'Scan failed: ' + resp.error;
    }
  });
});
