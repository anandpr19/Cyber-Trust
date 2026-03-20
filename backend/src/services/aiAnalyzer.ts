import axios from 'axios';
import { Finding } from './policyEngine';
import { StoreMetadata } from './chromeStoreScraper';

export interface AIAnalysisResult {
    summary: string;
    riskLevel: string;
}

/**
 * Provider-agnostic AI analyzer.
 * Works with ANY OpenAI-compatible API: Groq, OpenRouter, Together AI, OpenAI, etc.
 *
 * Environment variables:
 *   AI_API_KEY    — Your API key (required)
 *   AI_BASE_URL   — API base URL (default: Groq)
 *   AI_MODEL      — Model name  (default: llama-3.3-70b-versatile)
 *
 * Common base URLs:
 *   Groq:        https://api.groq.com/openai/v1
 *   OpenRouter:  https://openrouter.ai/api/v1
 *   Together AI: https://api.together.xyz/v1
 *   OpenAI:      https://api.openai.com/v1
 */

/**
 * Auto-detect the right default model based on the base URL
 */
function getDefaultModel(baseUrl: string): string {
    if (baseUrl.includes('openrouter')) return 'meta-llama/llama-3.3-70b-instruct';
    if (baseUrl.includes('together')) return 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
    if (baseUrl.includes('openai.com')) return 'gpt-4o-mini';
    return 'llama-3.3-70b-versatile'; // Groq default
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
 * Analyze extension using any OpenAI-compatible LLM for contextual risk assessment.
 * Falls back gracefully if API key is missing or call fails.
 */
export async function analyzeWithAI(
    manifest: Record<string, any>,
    findings: Finding[],
    storeMetadata?: StoreMetadata | null,
    extensionName?: string
): Promise<AIAnalysisResult | null> {
    // Support old GROQ_API_KEY and GEMINI_API_KEY for backward compatibility
    const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
    const model = process.env.AI_MODEL || getDefaultModel(baseUrl);

    if (!apiKey) {
        console.log('ℹ️ AI_API_KEY not set - skipping AI analysis');
        return null;
    }

    try {
        console.log(`🤖 Starting AI analysis (${model} via ${baseUrl})...`);

        const userPrompt = formatPrompt(manifest, findings, storeMetadata, extensionName);

        const response = await axios.post(
            `${baseUrl}/chat/completions`,
            {
                model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.3,
                max_tokens: 500,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        const text = response.data?.choices?.[0]?.message?.content;

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
    } catch (err: any) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message || 'Unknown error';
        console.warn(`⚠️ AI analysis failed (${status || 'network'}): ${msg}`);
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

    return prompt;
}
