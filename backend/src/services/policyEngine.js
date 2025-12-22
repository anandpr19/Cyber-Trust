// src/services/policyEngine.js
const riskyPermissions = {
  "history": { penalty: 25, desc: "Reads browsing history (can expose visited sites)." },
  "cookies": { penalty: 20, desc: "Access to cookies - can leak session tokens." },
  "clipboardRead": { penalty: 20, desc: "Can read clipboard (sensitive data risk)." },
  "clipboardWrite": { penalty: 20, desc: "Can write to clipboard (replace sensitive data)." },
  "tabs": { penalty: 10, desc: "Access to tabs - can enumerate open pages." },
  "webRequest": { penalty: 20, desc: "Intercepts and modifies network requests." },
  "webRequestBlocking": { penalty: 25, desc: "Can block/modify network requests." },
  "geolocation": { penalty: 15, desc: "Access to location." },
  "camera": { penalty: 30, desc: "Access to camera." },
  "microphone": { penalty: 30, desc: "Access to microphone." }
};

const patterns = [
  { key: 'http', regex: /http:\/\//i, penalty: 30, desc: 'Insecure HTTP usage (http://) found' },
  { key: 'localStorage', regex: /localStorage\.(setItem|getItem|removeItem)|localStorage\[/i, penalty: 15, desc: 'Uses localStorage — may store sensitive info' },
  { key: 'weakCrypto', regex: /\b(md5|sha1)\b/i, penalty: 20, desc: 'Weak hashing algorithms referenced (MD5/SHA1)' }
];

exports.evaluatePolicies = (manifest, files) => {
  let score = 100;
  const findings = [];

  const perms = new Set();
  if (Array.isArray(manifest.permissions)) manifest.permissions.forEach(p => perms.add(p));
  if (Array.isArray(manifest.optional_permissions)) manifest.optional_permissions.forEach(p => perms.add(p));
  if (Array.isArray(manifest.host_permissions)) manifest.host_permissions.forEach(p => perms.add(p));

  perms.forEach(p => {
    // host patterns like <all_urls> etc.
    if (typeof p === 'string') {
      const lower = p.toLowerCase();
      Object.keys(riskyPermissions).forEach(k => {
        if (lower.includes(k.toLowerCase())) {
          const r = riskyPermissions[k];
          findings.push(`⚠️ Permission: ${k} — ${r.desc}`);
          score -= r.penalty;
        }
      });
      if (lower.includes('<all_urls>') || lower.includes('*://*/*') || lower.includes('http://')) {
        findings.push('⚠️ Host permission: extension can read/modify data on many sites.');
        score -= 15;
      }
    }
  });

  // scan file contents
  for (const [name, content] of Object.entries(files)) {
    for (const rule of patterns) {
      if (rule.regex.test(content)) {
        findings.push(`❌ ${rule.desc} in ${name}`);
        score -= rule.penalty;
      }
    }
  }

  if (score < 0) score = 0;
  if (findings.length === 0) findings.push('✅ No obvious issues found by static checks (manual review recommended).');

  return { score, findings };
};
