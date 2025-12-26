/**
 * Risky permissions and their penalty scores
 */
const RISKY_PERMISSIONS = {
  'history': {
    penalty: 25,
    severity: 'high',
    desc: 'Reads browsing history - can expose all visited websites'
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
  'clipboardWrite': {
    penalty: 15,
    severity: 'medium',
    desc: 'Can modify clipboard - could replace data you intend to paste'
  },
  'tabs': {
    penalty: 10,
    severity: 'low',
    desc: 'Access to tab information - can see what sites you have open'
  },
  'webRequest': {
    penalty: 20,
    severity: 'high',
    desc: 'Can intercept network requests - may monitor your traffic'
  },
  'webRequestBlocking': {
    penalty: 25,
    severity: 'high',
    desc: 'Can block or modify network requests - could break websites'
  },
  'geolocation': {
    penalty: 15,
    severity: 'medium',
    desc: 'Access to your location - privacy concern'
  },
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
  }
};

/**
 * Code patterns that indicate security risks
 */
const CODE_PATTERNS = [
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
  }
];

/**
 * Evaluate security policies against manifest and files
 */
function evaluatePolicies(manifest, files) {
  let score = 100;
  const findings = [];

  console.log('📋 Checking permissions...');
  
  // Collect all permissions
  const permissions = new Set();
  
  if (Array.isArray(manifest.permissions)) {
    manifest.permissions.forEach(p => permissions.add(p));
  }
  if (Array.isArray(manifest.optional_permissions)) {
    manifest.optional_permissions.forEach(p => permissions.add(p));
  }
  if (Array.isArray(manifest.host_permissions)) {
    manifest.host_permissions.forEach(p => permissions.add(p));
  }

  // Check each permission
  permissions.forEach(perm => {
    if (typeof perm === 'string') {
      const lower = perm.toLowerCase();

      // Check against risky permissions
      Object.entries(RISKY_PERMISSIONS).forEach(([key, risk]) => {
        if (lower.includes(key.toLowerCase())) {
          const finding = {
            type: 'permission',
            severity: risk.severity,
            permission: key,
            description: risk.desc
          };
          findings.push(finding);
          score -= risk.penalty;
          console.log(`  ⚠️ ${key}: -${risk.penalty} points`);
        }
      });

      // Check for overly broad host permissions
      if (lower === '<all_urls>' || lower === '*://*/*' || lower.includes('*://*')) {
        const finding = {
          type: 'host-permission',
          severity: 'critical',
          description: 'Has access to all websites - can read/modify data on any site',
          permission: perm
        };
        findings.push(finding);
        score -= 20;
        console.log(`  ⛔ Broad host permission: -20 points`);
      }
    }
  });

  console.log('🔍 Scanning code for security issues...');

  // Scan file contents for patterns
  let filesScanned = 0;
  let issuesFound = 0;

  Object.entries(files).forEach(([filename, content]) => {
    // Only check text files (JS, HTML, JSON)
    if (!filename.match(/\.(js|html|json|css)$/i)) return;
    
    filesScanned++;

    CODE_PATTERNS.forEach(pattern => {
      if (pattern.regex.test(content)) {
        const finding = {
          type: 'code-pattern',
          severity: pattern.severity,
          pattern: pattern.key,
          description: pattern.desc,
          file: filename
        };
        findings.push(finding);
        score -= pattern.penalty;
        issuesFound++;
        console.log(`  ⚠️ ${pattern.key} in ${filename}: -${pattern.penalty} points`);
      }
    });
  });

  console.log(`  Scanned ${filesScanned} files, found ${issuesFound} issues`);

  // Check manifest version
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

  // Ensure no negative score
  if (score < 0) score = 0;

  // If no findings, add a positive message
  if (findings.length === 0) {
    findings.push({
      type: 'info',
      severity: 'good',
      description: 'No obvious security issues detected in static analysis'
    });
  }

  return { score, findings };
}

module.exports = {
  evaluatePolicies,
  RISKY_PERMISSIONS,
  CODE_PATTERNS
};