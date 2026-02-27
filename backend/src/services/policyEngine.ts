export interface RiskPermission {
  penalty: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  desc: string;
}

export interface CodePattern {
  key: string;
  regex: RegExp;
  penalty: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  desc: string;
}

export interface Finding {
  type: 'permission' | 'host-permission' | 'code-pattern' | 'deprecated' | 'info' | 'content-script' | 'csp' | 'sensitive-domain' | 'permission-combo';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  description: string;
  permission?: string;
  pattern?: string;
  file?: string;
  value?: string;
  domains?: string[];
}

export interface PolicyEvaluationResult {
  score: number;
  findings: Finding[];
}

// ─── Permission Risk Maps ────────────────────────────────────────────

const RISKY_PERMISSIONS: Record<string, RiskPermission> = {
  // Critical
  'camera': {
    penalty: 30,
    severity: 'critical',
    desc: 'Access to webcam - serious privacy/security risk'
  },
  'microphone': {
    penalty: 30,
    severity: 'critical',
    desc: 'Access to microphone - serious privacy/security risk'
  },
  'management': {
    penalty: 30,
    severity: 'critical',
    desc: 'Can manage other extensions - could disable security tools'
  },
  'debugger': {
    penalty: 25,
    severity: 'critical',
    desc: 'Can debug and manipulate other extensions/apps - extremely powerful'
  },
  // High
  'history': {
    penalty: 25,
    severity: 'high',
    desc: 'Reads browsing history - can expose all visited websites'
  },
  'webRequestBlocking': {
    penalty: 25,
    severity: 'high',
    desc: 'Can block or modify network requests - could break websites or intercept data'
  },
  'cookies': {
    penalty: 20,
    severity: 'high',
    desc: 'Access to browser cookies - can steal session tokens'
  },
  'clipboardRead': {
    penalty: 20,
    severity: 'high',
    desc: 'Can read clipboard - may expose sensitive data you copied'
  },
  'webRequest': {
    penalty: 20,
    severity: 'high',
    desc: 'Can intercept network requests - may monitor your traffic'
  },
  'proxy': {
    penalty: 20,
    severity: 'high',
    desc: 'Can control proxy settings - could route traffic through malicious servers'
  },
  'webNavigation': {
    penalty: 15,
    severity: 'high',
    desc: 'Can track your web navigation - monitors page transitions and URL changes'
  },
  'downloads': {
    penalty: 15,
    severity: 'high',
    desc: 'Can download files and access download history'
  },
  'privacy': {
    penalty: 15,
    severity: 'high',
    desc: 'Can modify privacy settings in the browser'
  },
  'identity': {
    penalty: 15,
    severity: 'high',
    desc: 'Can access your identity information and OAuth tokens'
  },
  'bookmarks': {
    penalty: 15,
    severity: 'high',
    desc: 'Can access and modify your bookmarks'
  },
  // Medium
  'clipboardWrite': {
    penalty: 15,
    severity: 'medium',
    desc: 'Can modify clipboard - could replace data you intend to paste'
  },
  'geolocation': {
    penalty: 15,
    severity: 'medium',
    desc: 'Access to your location - privacy concern'
  },
  'notifications': {
    penalty: 10,
    severity: 'medium',
    desc: 'Can show notifications - could be used for social engineering'
  },
  'unlimitedStorage': {
    penalty: 10,
    severity: 'medium',
    desc: 'Can store unlimited data locally - unusual requirement'
  },
  'contextMenus': {
    penalty: 5,
    severity: 'medium',
    desc: 'Can add items to the context menu'
  },
  // Low
  'tabs': {
    penalty: 10,
    severity: 'low',
    desc: 'Access to tab information - can see what sites you have open'
  },
  'activeTab': {
    penalty: 5,
    severity: 'low',
    desc: 'Can access the active tab when clicking the extension icon'
  },
  'storage': {
    penalty: 5,
    severity: 'low',
    desc: 'Can store data locally - generally safe'
  }
};

// ─── Code Patterns ───────────────────────────────────────────────────

const CODE_PATTERNS: CodePattern[] = [
  {
    key: 'insecure-http',
    regex: /http:\/\/[a-zA-Z0-9.-]+\.(com|org|net|io)/i,
    penalty: 15,
    severity: 'medium',
    desc: 'Uses unencrypted HTTP connections instead of HTTPS'
  },
  {
    key: 'weak-crypto-md5',
    regex: /\bmd5\s*\(/i,
    penalty: 20,
    severity: 'high',
    desc: 'Uses MD5 hashing - cryptographically broken algorithm'
  },
  {
    key: 'weak-crypto-sha1',
    regex: /\bsha1\s*\(/i,
    penalty: 20,
    severity: 'high',
    desc: 'Uses SHA1 hashing - considered insecure for cryptography'
  },
  {
    key: 'unsecure-storage-localstorage',
    regex: /localStorage\.(setItem|getItem|removeItem)|localStorage\[/i,
    penalty: 15,
    severity: 'medium',
    desc: 'Stores data in localStorage - not encrypted, vulnerable to XSS'
  },
  {
    key: 'hardcoded-credentials',
    regex: /(password|apikey|token|secret)\s*[:=]\s*['"]/i,
    penalty: 30,
    severity: 'critical',
    desc: 'Hardcoded credentials found - security risk'
  },
  {
    key: 'eval-usage',
    regex: /\beval\s*\(/,
    penalty: 20,
    severity: 'high',
    desc: 'Uses eval() - can execute arbitrary code, major security risk'
  },
  {
    key: 'document-write',
    regex: /document\.write\s*\(/,
    penalty: 15,
    severity: 'medium',
    desc: 'Uses document.write() - can be exploited for XSS attacks'
  },
  {
    key: 'innerHTML-assignment',
    regex: /\.innerHTML\s*=/,
    penalty: 10,
    severity: 'medium',
    desc: 'Uses innerHTML assignment - potential XSS vector if user input is involved'
  }
];

// ─── Sensitive Domains ───────────────────────────────────────────────

const SENSITIVE_DOMAINS: string[] = [
  // Banks
  'chase', 'bankofamerica', 'wellsfargo', 'citibank', 'capitalone',
  'usbank', 'barclays', 'hsbc', 'santander', 'tdbank', 'scotiabank',
  // Financial Services
  'paypal', 'venmo', 'wise', 'stripe', 'square', 'cashapp',
  'revolut', 'robinhood', 'fidelity', 'vanguard', 'schwab', 'etrade',
  // Crypto
  'coinbase', 'binance', 'kraken', 'metamask', 'crypto.com',
  'gemini', 'ledger', 'trezor', 'blockchain.com',
  // Social & Email
  'google', 'facebook', 'instagram', 'twitter', 'linkedin',
  'outlook', 'protonmail', 'yahoo', 'gmail',
  // E-commerce
  'amazon', 'shopify', 'ebay', 'walmart',
  // Dev Platforms
  'github', 'gitlab', 'bitbucket', 'stackoverflow', 'npmjs',
];

// ─── Risky Host Patterns ────────────────────────────────────────────

const RISKY_HOST_PATTERNS = [
  '*://*/*',
  '<all_urls>',
  '*://*',
  'file:///*',
  '*'
];

// ─── Main Evaluation Function ────────────────────────────────────────

export function evaluatePolicies(
  manifest: Record<string, any>,
  files: Record<string, string>
): PolicyEvaluationResult {
  let score = 100;
  const findings: Finding[] = [];

  console.log('📋 Checking permissions...');

  // Collect all permissions
  const permissions = new Set<string>();

  if (Array.isArray(manifest.permissions)) {
    manifest.permissions.forEach((p: string) => permissions.add(p));
  }
  if (Array.isArray(manifest.optional_permissions)) {
    manifest.optional_permissions.forEach((p: string) => permissions.add(p));
  }
  if (Array.isArray(manifest.host_permissions)) {
    manifest.host_permissions.forEach((p: string) => permissions.add(p));
  }

  // ── Check permissions ──
  const matchedPermissions = new Set<string>();

  permissions.forEach((perm) => {
    const lower = perm.toLowerCase();

    Object.entries(RISKY_PERMISSIONS).forEach(([key, risk]) => {
      if (lower.includes(key.toLowerCase()) && !matchedPermissions.has(key)) {
        matchedPermissions.add(key);
        findings.push({
          type: 'permission',
          severity: risk.severity,
          permission: key,
          description: risk.desc
        });
        score -= risk.penalty;
        console.log(`  ⚠️ ${key}: -${risk.penalty} points`);
      }
    });

    // Check for overly broad host permissions
    if (
      lower === '<all_urls>' ||
      lower === '*://*/*' ||
      lower.includes('*://*')
    ) {
      findings.push({
        type: 'host-permission',
        severity: 'critical',
        description: 'Has access to all websites - can read/modify data on any site',
        permission: perm
      });
      score -= 20;
      console.log(`  ⛔ Broad host permission: -20 points`);
    }
  });

  // ── Dangerous Permission Combos (NEW) ──
  console.log('🔗 Checking permission combinations...');
  const permArray = Array.from(permissions).map(p => p.toLowerCase());
  if (permArray.includes('webrequest') && permArray.includes('webrequestblocking')) {
    findings.push({
      type: 'permission-combo',
      severity: 'high',
      description: 'Dangerous combination: webRequest + webRequestBlocking. Can intercept, modify, and block web requests in real-time. Could be used to modify sensitive web traffic or steal data.',
      permission: 'webRequest + webRequestBlocking'
    });
    score -= 25;
    console.log('  ⛔ Dangerous combo webRequest+webRequestBlocking: -25 points');
  }

  // ── Content Script Injection Detection (NEW) ──
  console.log('📜 Checking content scripts...');
  if (Array.isArray(manifest.content_scripts)) {
    const hasBroadInjection = manifest.content_scripts.some((script: any) => {
      if (!Array.isArray(script.matches)) return false;
      return script.matches.some((match: string) =>
        RISKY_HOST_PATTERNS.some(pattern => match === pattern || match.includes('*://*'))
      );
    });

    if (hasBroadInjection) {
      findings.push({
        type: 'content-script',
        severity: 'high',
        description: 'Can inject scripts into any website. Could potentially read sensitive data, modify website content, or steal credentials on every page you visit.'
      });
      score -= 20;
      console.log('  ⛔ Broad content script injection: -20 points');
    }
  }

  // ── CSP Analysis (NEW) ──
  console.log('🛡️ Checking Content Security Policy...');
  const csp = manifest.content_security_policy;
  if (csp) {
    const cspStrings: string[] = [];
    if (typeof csp === 'string') {
      cspStrings.push(csp);
    } else if (typeof csp === 'object') {
      Object.values(csp).forEach((v) => {
        if (typeof v === 'string') cspStrings.push(v);
      });
    }

    const cspJoined = cspStrings.join(' ');

    if (cspJoined.includes("'unsafe-eval'")) {
      findings.push({
        type: 'csp',
        severity: 'high',
        description: "Content Security Policy allows 'unsafe-eval' - permits dynamic JavaScript execution using eval() and similar functions. Significant security risk.",
        value: 'unsafe-eval'
      });
      score -= 20;
      console.log("  ⛔ CSP allows unsafe-eval: -20 points");
    }

    if (cspJoined.includes("'wasm-unsafe-eval'")) {
      findings.push({
        type: 'csp',
        severity: 'medium',
        description: "Content Security Policy allows 'wasm-unsafe-eval' - permits potentially dangerous WebAssembly code execution. Could hide malicious code.",
        value: 'wasm-unsafe-eval'
      });
      score -= 15;
      console.log("  ⚠️ CSP allows wasm-unsafe-eval: -15 points");
    }
  }

  // ── Sensitive Domain Detection (NEW) ──
  console.log('🏦 Checking for sensitive domain access...');
  const hostPerms = Array.isArray(manifest.host_permissions) ? manifest.host_permissions : [];
  const allHostPatterns = [...hostPerms];

  // Also check content script matches for domain access
  if (Array.isArray(manifest.content_scripts)) {
    manifest.content_scripts.forEach((script: any) => {
      if (Array.isArray(script.matches)) {
        allHostPatterns.push(...script.matches);
      }
    });
  }

  const matchedDomains = SENSITIVE_DOMAINS.filter(domain =>
    allHostPatterns.some((pattern: string) => pattern.toLowerCase().includes(domain))
  );

  if (matchedDomains.length > 0) {
    findings.push({
      type: 'sensitive-domain',
      severity: 'medium',
      description: `Requests access to sensitive domains: ${matchedDomains.join(', ')}. Ensure you trust this extension with access to these sites.`,
      domains: matchedDomains
    });
    score -= 10;
    console.log(`  ⚠️ Sensitive domain access (${matchedDomains.length} domains): -10 points`);
  }

  // ── Code Pattern Scanning ──
  console.log('🔍 Scanning code for security issues...');

  let filesScanned = 0;
  let issuesFound = 0;

  Object.entries(files).forEach(([filename, content]) => {
    if (!filename.match(/\.(js|html|json|css|ts|jsx|tsx)$/i)) return;

    filesScanned++;

    CODE_PATTERNS.forEach((pattern) => {
      if (pattern.regex.test(content)) {
        findings.push({
          type: 'code-pattern',
          severity: pattern.severity,
          pattern: pattern.key,
          description: pattern.desc,
          file: filename
        });
        score -= pattern.penalty;
        issuesFound++;
        console.log(`  ⚠️ ${pattern.key} in ${filename}: -${pattern.penalty} points`);
      }
    });
  });

  console.log(`  Scanned ${filesScanned} files, found ${issuesFound} issues`);

  // ── Manifest version check ──
  if (manifest.manifest_version === 2) {
    findings.push({
      type: 'deprecated',
      severity: 'medium',
      description: 'Uses Manifest V2 - deprecated by Chrome. Update to V3.',
      value: 'manifest_version'
    });
    score -= 5;
    console.log(`  ⚠️ Manifest V2 detected: -5 points`);
  }

  // Clamp score to 0-100
  if (score < 0) score = 0;

  if (findings.length === 0) {
    findings.push({
      type: 'info',
      severity: 'good',
      description: 'No obvious security issues detected in static analysis'
    });
  }

  return { score, findings };
}

export { RISKY_PERMISSIONS, CODE_PATTERNS };