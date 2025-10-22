// Simple static checks:
// - analyze manifest permissions
// - scan .js/.html files for http://, localStorage usage, md5/sha1 presence
// - compute a score starting from 100

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

function analyzePackage(manifest, files) {
  let score = 100;
  const findings = [];

  // 1) manifest permissions
  const perms = new Set();
  if (manifest.permissions && Array.isArray(manifest.permissions)) {
    manifest.permissions.forEach(p => perms.add(p));
  }
  if (manifest.host_permissions && Array.isArray(manifest.host_permissions)) {
    manifest.host_permissions.forEach(p => perms.add(p));
  }
  if (manifest.optional_permissions && Array.isArray(manifest.optional_permissions)) {
    manifest.optional_permissions.forEach(p => perms.add(p));
  }

  perms.forEach(p => {
    // normalize (some permissions appear as e.g. "<all_urls>")
    const normalized = p.toString();
    Object.keys(riskyPermissions).forEach(k => {
      if (normalized.toLowerCase().includes(k.toLowerCase())) {
        const item = riskyPermissions[k];
        findings.push(`⚠️ Permission: ${k} — ${item.desc}`);
        score -= item.penalty;
      }
    });

    // host permission check
    if (normalized.includes('<all_urls>') || normalized.includes('*://*/*') || normalized.includes('http://*/*')) {
      findings.push('⚠️ Host permission: extension can read/modify data on many sites.');
      score -= 15;
    }
  });

  // 2) scan code files for risky patterns
  const fileNames = Object.keys(files);
  let foundHttp = false;
  let foundLocalStorage = false;
  let foundWeakCrypto = false;

  for (const name of fileNames) {
    const lower = name.toLowerCase();
    if (lower.endsWith('.js') || lower.endsWith('.html') || lower.endsWith('.mjs') || lower.endsWith('.ts')) {
      const content = files[name].toString('utf8');

      if (!foundHttp && /http:\/\//i.test(content)) {
        findings.push('❌ Found insecure HTTP usage (http://) in code — should use HTTPS.');
        score -= 30;
        foundHttp = true;
      }
      if (!foundLocalStorage && /localStorage\.(setItem|getItem|removeItem)|localStorage\[/.test(content)) {
        findings.push('⚠️ Uses localStorage — may store sensitive info in plaintext.');
        score -= 15;
        foundLocalStorage = true;
      }
      if (!foundWeakCrypto && /\b(md5|sha1)\b/i.test(content)) {
        findings.push('⚠️ Found references to weak hashing (md5/sha1) — use SHA-256+');
        score -= 20;
        foundWeakCrypto = true;
      }
    }
  }

  // clamp score
  if (score < 0) score = 0;

  // short summary
  if (findings.length === 0) findings.push('✅ No obvious issues found by static checks (manual review recommended).');

  return { score, findings };
}

module.exports = { analyzePackage };
