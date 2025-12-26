const axios = require('axios');

const CHROME_VERSION = '131.0.6778.86'; // Current Chrome version
async function fetchFromGoogleWebStore(extensionId) {
  const url = `https://clients2.google.com/service/update2/crx?response=redirect&x=id%3D${extensionId}%26uc&prodversion=${CHROME_VERSION}`;

  console.log(`🔗 Fetching from Google Web Store: ${extensionId}`);

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        // CRITICAL: Google checks this first
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`,
        
        // Google expects these
        'Accept': 'application/octet-stream, */*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      
      // Handle redirects (IMPORTANT - CRX URLs redirect)
      maxRedirects: 10,
      
      // Timeout in milliseconds
      timeout: 30000,
      
      // THIS IS IMPORTANT: Accept any status code (Google redirects with 302)
      validateStatus: () => true,
      
      // Return as Buffer (not text)
      responseType: 'arraybuffer'
    });

    // Check if successful
    if (!response.data || response.data.length < 100) {
      throw new Error(`Empty response (${response.data?.length || 0} bytes)`);
    }

    console.log(`✅ Downloaded ${response.data.length} bytes from Google`);
    return Buffer.from(response.data);

  } catch (error) {
    console.warn(`❌ Google Web Store fetch failed: ${error.message}`);
    throw error;
  }
}

/**
 * Fallback method: Try alternative sources
 * (These are less reliable but work as backup)
 */
async function fetchFromMirror(extensionId) {
  const mirrors = [
    `https://crx.dam.io/${extensionId}.crx`,
    `https://chrome-extension-downloader.com/${extensionId}.crx`
  ];

  for (const mirrorUrl of mirrors) {
    try {
      console.log(`🔄 Trying mirror: ${mirrorUrl}`);

      const response = await axios({
        method: 'GET',
        url: mirrorUrl,
        headers: {
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`,
          'Accept': 'application/octet-stream'
        },
        timeout: 15000,
        validateStatus: () => true,
        responseType: 'arraybuffer'
      });

      if (response.data && response.data.length > 100) {
        console.log(`✅ Downloaded from mirror: ${response.data.length} bytes`);
        return Buffer.from(response.data);
      }
    } catch (err) {
      console.warn(`⚠️ Mirror failed: ${err.message}`);
    }
  }

  throw new Error('All fallback mirrors failed');
}

/**
 * Parse extension ID from Chrome Web Store URL
 * Handles multiple URL formats:
 * - https://chromewebstore.google.com/detail/name/abcdef123456
 * - chrome-extension://abcdef123456
 * - Just the ID: abcdef123456
 */
function extractExtensionId(input) {
  // If it's already a 32-char ID
  if (/^[a-p0-9]{32}$/.test(input)) {
    return input;
  }

  // Extract from Chrome Web Store URL
  const match = input.match(/([a-p0-9]{32})(?:\?|$)/);
  if (match) {
    return match[1];
  }

  // Extract from chrome-extension:// URL
  const extMatch = input.match(/chrome-extension:\/\/([a-p0-9]{32})/);
  if (extMatch) {
    return extMatch[1];
  }

  throw new Error(
    'Invalid extension ID or URL. Expected:\n' +
    '- Chrome Web Store URL: https://chromewebstore.google.com/detail/.../abc123...\n' +
    '- Extension ID: abc123... (32 characters)\n' +
    `- Got: ${input}`
  );
}

/**
 * Main export: Fetch extension by ID or URL
 * Returns Buffer containing CRX file
 */
async function fetchExtensionCRX(input) {
  try {
    // Step 1: Parse the input
    console.log(`\n📥 Fetch request: ${input}`);
    const extensionId = extractExtensionId(input);
    console.log(`✅ Extracted ID: ${extensionId}`);

    // Step 2: Try Google Web Store first (most reliable)
    try {
      return await fetchFromGoogleWebStore(extensionId);
    } catch (err) {
      console.warn(`⚠️ Google Web Store unavailable: ${err.message}`);
      console.log('🔄 Trying fallback mirrors...');
      
      // Step 3: If Google fails, try mirrors
      return await fetchFromMirror(extensionId);
    }

  } catch (err) {
    console.error(`❌ Failed to fetch extension: ${err.message}`);
    throw new Error(`Could not fetch extension: ${err.message}`);
  }
}

module.exports = {
  fetchExtensionCRX,
  extractExtensionId
};