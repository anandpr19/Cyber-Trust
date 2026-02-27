import axios from 'axios';

const CHROME_VERSION = '131.0.6778.86';

async function fetchFromGoogleWebStore(extensionId: string): Promise<Buffer> {
  const url = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3D${extensionId}%26installsource%3Dondemand%26uc&prodversion=${CHROME_VERSION}`;

  console.log(`🔗 Fetching from Google Web Store: ${extensionId}`);

  try {
    const response = await axios.get<any>(url, {
      headers: {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`,
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
      maxRedirects: 10,
      timeout: 30000,
      validateStatus: () => true,
      responseType: 'arraybuffer'
    } as any);

    if (!response.data || (response.data as Buffer).length < 100) {
      throw new Error(`Empty response (${(response.data as Buffer)?.length || 0} bytes)`);
    }

    console.log(`✅ Downloaded ${(response.data as Buffer).length} bytes from Google`);
    return Buffer.from(response.data as any);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`❌ Google Web Store fetch failed: ${errorMsg}`);
    throw error;
  }
}

async function fetchFromMirror(extensionId: string): Promise<Buffer> {
  const mirrors = [
    `https://crx.dam.io/${extensionId}.crx`,
    `https://chrome-extension-downloader.com/${extensionId}.crx`
  ];

  for (const mirrorUrl of mirrors) {
    try {
      console.log(`🔄 Trying mirror: ${mirrorUrl}`);

      const response = await axios.get<any>(mirrorUrl, {
        headers: {
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`,
          'Accept': 'application/octet-stream'
        },
        timeout: 15000,
        validateStatus: () => true,
        responseType: 'arraybuffer'
      } as any);

      if (response.data && (response.data as Buffer).length > 1000) {
        console.log(`✅ Downloaded from mirror: ${(response.data as Buffer).length} bytes`);
        return Buffer.from(response.data as any);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`⚠️ Mirror failed: ${errorMsg}`);
    }
  }

  throw new Error('All fallback mirrors failed');
}

export function extractExtensionId(input: string): string {
  if (/^[a-p0-9]{32}$/.test(input)) {
    return input;
  }

  const match = input.match(/([a-p0-9]{32})(?:\?|$)/);
  if (match) {
    return match[1];
  }

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

export async function fetchExtensionCRX(input: string): Promise<Buffer> {
  try {
    console.log(`\n📥 Fetch request: ${input}`);
    const extensionId = extractExtensionId(input);
    console.log(`✅ Extracted ID: ${extensionId}`);

    try {
      return await fetchFromGoogleWebStore(extensionId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`⚠️ Google Web Store unavailable: ${errorMsg}`);
      console.log('🔄 Trying fallback mirrors...');

      return await fetchFromMirror(extensionId);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Failed to fetch extension: ${errorMsg}`);
    throw new Error(`Could not fetch extension: ${errorMsg}`);
  }
}