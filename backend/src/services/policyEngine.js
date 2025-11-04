const baseRules = {
  permissions: {
    history: { penalty: 25, desc: 'Reads browsing history' },
    cookies: { penalty: 20, desc: 'Access to cookies' },
    tabs: { penalty: 10, desc: 'Access to open tabs' },
    webRequest: { penalty: 20, desc: 'Intercepts network requests' },
    webRequestBlocking: { penalty: 25, desc: 'Blocks or alters requests' },
    clipboardRead: { penalty: 15, desc: 'Can read clipboard data' },
    clipboardWrite: { penalty: 15, desc: 'Can modify clipboard data' },
    camera: { penalty: 30, desc: 'Access to camera' },
    microphone: { penalty: 30, desc: 'Access to microphone' }
  },
  patterns: {
    http: { regex: /http:\/\//i, penalty: 25, desc: 'Insecure HTTP usage' },
    localStorage: { regex: /localStorage\./i, penalty: 15, desc: 'Uses localStorage (plaintext risk)' },
    weakCrypto: { regex: /\b(md5|sha1)\b/i, penalty: 20, desc: 'Uses weak crypto (MD5/SHA1)' }
  }
};  

exports.evaluatePolicies = (manifest, files) => {
  let score = 100;
  const findings = [];

  // Check permissions
  const perms = [
    ...(manifest.permissions || []),
    ...(manifest.optional_permissions || []),
    ...(manifest.host_permissions || [])
  ];

  for (const p of perms) {
    const rule = baseRules.permissions[p];
    if (rule) {
      findings.push(`⚠️ ${p}: ${rule.desc}`);
      score -= rule.penalty;
    }
  }

  // Code pattern scanning
  for (const [fileName, content] of Object.entries(files)) {
    for (const [key, rule] of Object.entries(baseRules.patterns)) {
      if (rule.regex.test(content)) {
        findings.push(`❌ ${rule.desc} in ${fileName}`);
        score -= rule.penalty;
      }
    }
  }

  if (score < 0) score = 0;
  if (findings.length === 0) findings.push('✅ No obvious issues found.');
  return { score, findings };
};
