const axios = require('axios');
const { PROD_VERSION } = require('../config');

async function downloadCrx(extensionId) {
  // This is the query string that usually works.
  const url = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=${encodeURIComponent(PROD_VERSION)}&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CyberTrust/1.0)'
    },
    timeout: 20000
  });
  return Buffer.from(resp.data);
}

module.exports = { downloadCrx };
