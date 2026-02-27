import { GoogleGenerativeAI } from '@google/generative-ai';
import { Finding } from './policyEngine';
import { StoreMetadata } from './chromeStoreScraper';

export interface AIAnalysisResult {
    summary: string;
    riskLevel: string;
}

const SYSTEM_PROMPT = `You are a security analysis tool called Cyber-Trust that assesses Chrome Extensions for risk. Given metrics that are visible to the user, analyze the risk of the chrome extension, and provide a short summary under 200 words adding context to the findings that the user can already see (do not repeat the extension's permissions verbatim).

Your response should include:
1. Your own risk level assessment (Critical, High, Medium, Low, or Minimal)
2. Trust factors based on the extension's description, downloads, company reputation, etc.
3. A list of specific concerns, including unnecessary permissions given the nature of the extension
4. Practical recommendations for the user

Format your response as plain text. Do not use markdown formatting or asterisks for bold text.
Start your response with "Risk Level: " followed by your assessment.`;

/**
 * Analyze extension using Google Gemini AI for contextual risk assessment.
 * Falls back gracefully if API key is missing or call fails.
 */
export async function analyzeWithAI(
    manifest: Record<string, any>,
    findings: Finding[],
    storeMetadata?: StoreMetadata | null,
    extensionName?: string
): Promise<AIAnalysisResult | null> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.log('ℹ️ GEMINI_API_KEY not set - skipping AI analysis');
        return null;
    }

    try {
        console.log('🤖 Starting AI analysis...');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500,
            },
        });

        const prompt = formatPrompt(manifest, findings, storeMetadata, extensionName);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
            console.warn('⚠️ AI returned empty response');
            return null;
        }

        // Extract risk level from the response
        const riskLevelMatch = text.match(/Risk Level:\s*(Critical|High|Medium|Low|Minimal)/i);
        const riskLevel = riskLevelMatch ? riskLevelMatch[1] : 'Unknown';

        console.log(`✅ AI analysis complete. AI Risk Level: ${riskLevel}`);

        return {
            summary: text,
            riskLevel,
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.warn(`⚠️ AI analysis failed: ${msg}`);
        return null;
    }
}

function formatPrompt(
    manifest: Record<string, any>,
    findings: Finding[],
    storeMetadata?: StoreMetadata | null,
    extensionName?: string
): string {
    const name = extensionName || storeMetadata?.name || manifest.name || 'Unknown Extension';
    const permissions = manifest.permissions || [];
    const hostPermissions = manifest.host_permissions || [];
    const contentScripts = manifest.content_scripts || [];

    let prompt = `Analyze this Chrome extension:\n\n`;
    prompt += `Extension Details:\n`;
    prompt += `Name: ${name}\n`;
    prompt += `Version: ${manifest.version || 'Unknown'}\n`;
    prompt += `Description: ${manifest.description || 'No description'}\n`;
    prompt += `Manifest Version: ${manifest.manifest_version || 'Unknown'}\n`;

    if (storeMetadata) {
        prompt += `Size: ${storeMetadata.size || 'Unknown'}\n`;
        prompt += `Users: ${storeMetadata.users || 'Unknown'}\n`;
        prompt += `Last Updated: ${storeMetadata.lastUpdated || 'Unknown'}\n`;
        prompt += `Rating: ${storeMetadata.rating || 'Unknown'} (${storeMetadata.ratingCount || '0'} reviews)\n`;
        prompt += `Author: ${storeMetadata.author || 'Unknown'}\n`;
    }

    prompt += `\nTechnical Details:\n`;
    prompt += `Permissions: ${permissions.join(', ') || 'None'}\n`;
    prompt += `Host Permissions: ${hostPermissions.join(', ') || 'None'}\n`;
    prompt += `Content Scripts: ${contentScripts.map((cs: any) => cs.matches?.join(', ')).filter(Boolean).join('; ') || 'None'}\n`;

    if (manifest.content_security_policy) {
        const csp = typeof manifest.content_security_policy === 'string'
            ? manifest.content_security_policy
            : JSON.stringify(manifest.content_security_policy);
        prompt += `CSP: ${csp}\n`;
    }

    prompt += `\nSecurity Findings (${findings.length} total):\n`;
    findings.forEach((f) => {
        if (f.type !== 'info') {
            prompt += `${f.severity.toUpperCase()}: ${f.description}\n`;
        }
    });

    return SYSTEM_PROMPT + '\n\n' + prompt;
}
