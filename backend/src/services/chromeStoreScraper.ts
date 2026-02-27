import axios from 'axios';
import * as cheerio from 'cheerio';

export interface StoreMetadata {
    name: string;
    icon: string;
    rating: string;
    ratingCount: string;
    users: string;
    size: string;
    author: string;
    lastUpdated: string;
    storeUrl: string;
}

const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Safari/537.36';

/**
 * Scrape extension metadata from the Chrome Web Store page.
 * Falls back gracefully — returns partial data on errors.
 */
export async function scrapeStoreMetadata(extensionId: string): Promise<StoreMetadata | null> {
    try {
        const storeUrl = `https://chromewebstore.google.com/detail/${extensionId}`;

        console.log(`🏪 Scraping Chrome Web Store: ${storeUrl}`);

        const response = await axios.get(storeUrl, {
            headers: {
                'User-Agent': CHROME_USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate',
            },
            maxRedirects: 10,
            timeout: 15000,
            validateStatus: (status) => status < 400,
        });

        const $ = cheerio.load(response.data);

        // Extract extension name from h1
        const rawName = $('h1').first().text().trim();
        const name = rawName
            .replace(/&mdash;/g, '—')
            .replace(/&ndash;/g, '-')
            .replace(/&reg;/g, '®')
            .replace(/&trade;/g, '™')
            .replace(/&copy;/g, '©')
            .replace(/&amp;/g, '&');

        // Extract icon
        const icon = $('.rBxtY').first().attr('src') || '';

        // Extract metadata fields
        const sizeElement = $('.nws2nb').filter((_, el) => $(el).text().trim() === 'Size').first();
        const updatedElement = $('.nws2nb').filter((_, el) => $(el).text().trim() === 'Updated').first();

        const size = sizeElement.next().text().trim() || '';
        const lastUpdated = updatedElement.next().text().trim() || '';

        // Extract author
        const author = ($('.cJI8ee').first().text().trim() || '').replace(/&amp;/g, '&');

        // Extract rating
        const rating = $('.Vq0ZA').first().text().trim() || '';
        const ratingCount = $('.xJEoWe').first().text().trim() || '';

        // Extract user count
        const usersText = $('div.F9iKBc').first().text().trim() || '';
        const users = usersText.split(' ')[0] || '';

        const metadata: StoreMetadata = {
            name: name || 'Unknown',
            icon,
            rating,
            ratingCount,
            users,
            size,
            author,
            lastUpdated,
            storeUrl
        };

        console.log(`✅ Store metadata scraped: ${metadata.name} (${metadata.rating} stars, ${metadata.users} users)`);
        return metadata;
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.warn(`⚠️ Chrome Web Store scraping failed: ${msg}`);
        console.warn('   Analysis will continue without store metadata.');
        return null;
    }
}
