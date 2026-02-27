export interface RawFinding {
  type: 'permission' | 'host-permission' | 'code-pattern' | 'deprecated' | 'info' | 'content-script' | 'csp' | 'sensitive-domain' | 'permission-combo';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  description: string;
  permission?: string;
  pattern?: string;
  file?: string;
  value?: string;
  domains?: string[];
}

export interface GroupedFinding {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  title: string;
  explanation: string;
  files?: string[];
  count: number;
  icon: string;
}

export interface UserFriendlyReport {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  riskScore: number;
  riskPercentage: number;
  summary: string;
  categories: {
    critical: GroupedFinding[];
    high: GroupedFinding[];
    medium: GroupedFinding[];
    low: GroupedFinding[];
  };
  totalIssues: number;
  recommendations: string[];
}

// Friendly explanations for each pattern
const PATTERN_EXPLANATIONS: Record<string, { title: string; explanation: string; severity: string }> = {
  'eval-usage': {
    title: '⛔ Uses eval() Function',
    explanation:
      'This extension uses eval() to execute code dynamically. This is a major security risk because it can execute arbitrary JavaScript code. If this extension is compromised, attackers could use this to steal data or manipulate your browser.',
    severity: 'HIGH'
  },
  'hardcoded-credentials': {
    title: '🔑 Hardcoded Credentials Found',
    explanation:
      'This extension contains hardcoded passwords, API keys, or secrets in its code. These can be extracted and used by attackers. Sensitive credentials should never be stored in plain text in extensions.',
    severity: 'CRITICAL'
  },
  'insecure-http': {
    title: '🌐 Unencrypted HTTP Connections',
    explanation:
      'This extension communicates using unencrypted HTTP instead of HTTPS. This means data could be intercepted while in transit. All communication should use HTTPS for protection.',
    severity: 'MEDIUM'
  },
  'weak-crypto-md5': {
    title: '🔓 Weak Hashing Algorithm (MD5)',
    explanation:
      'This extension uses MD5 for cryptography, which is cryptographically broken. MD5 collisions can be generated, making it unsuitable for further hashing. Use SHA-256 or better instead.',
    severity: 'HIGH'
  },
  'weak-crypto-sha1': {
    title: '🔓 Weak Hashing Algorithm (SHA1)',
    explanation:
      'This extension uses SHA1 for cryptography, which is considered insecure. SHA1 is deprecated for cryptographic use. Use SHA-256 or better instead.',
    severity: 'HIGH'
  },
  'unsecure-storage-localstorage': {
    title: '💾 Insecure Local Storage',
    explanation:
      'This extension stores data in localStorage, which is not encrypted. Anyone with access to your browser data can read it. Use secure storage mechanisms instead.',
    severity: 'MEDIUM'
  },
  'document-write': {
    title: '📝 Uses document.write()',
    explanation:
      'This extension uses document.write(), which can be exploited for XSS attacks and can cause unexpected page behavior. Modern alternatives like DOM manipulation methods should be used instead.',
    severity: 'MEDIUM'
  },
  'innerHTML-assignment': {
    title: '⚠️ innerHTML Assignment',
    explanation:
      'This extension assigns to innerHTML, which is a potential XSS vector if user input is involved. Use textContent or DOM methods for safer alternatives.',
    severity: 'MEDIUM'
  }
};

const PERMISSION_EXPLANATIONS: Record<
  string,
  { title: string; explanation: string; risk: string; severity: string }
> = {
  history: {
    title: '📜 Browsing History Access',
    explanation: 'This extension can read your complete browsing history, including all websites you have visited.',
    risk: 'Can expose your entire browsing activity and interests',
    severity: 'HIGH'
  },
  cookies: {
    title: '🍪 Cookie Access',
    explanation:
      'This extension can access and modify your browser cookies, which contain session tokens and authentication data.',
    risk: 'Could steal login sessions and authentication credentials',
    severity: 'HIGH'
  },
  clipboardRead: {
    title: '📋 Clipboard Read',
    explanation: 'This extension can read everything you copy or cut to your clipboard.',
    risk: 'Can capture passwords, credit card numbers, and other sensitive data you copy',
    severity: 'HIGH'
  },
  clipboardWrite: {
    title: '📝 Clipboard Write',
    explanation: 'This extension can modify your clipboard contents.',
    risk: 'Could replace sensitive data you intend to paste',
    severity: 'MEDIUM'
  },
  tabs: {
    title: '🔖 Tab Information Access',
    explanation: 'This extension can see information about all your open tabs.',
    risk: 'Can see what websites you currently have open',
    severity: 'LOW'
  },
  webRequest: {
    title: '🌐 Network Request Interception',
    explanation: 'This extension can monitor all your network traffic.',
    risk: 'Can see all data transmitted over the network',
    severity: 'HIGH'
  },
  webRequestBlocking: {
    title: '🚫 Network Request Blocking',
    explanation: 'This extension can block or modify network requests.',
    risk: 'Could break websites or intercept data',
    severity: 'HIGH'
  },
  geolocation: {
    title: '📍 Location Access',
    explanation: 'This extension can access your precise geographic location.',
    risk: 'Could track your physical location',
    severity: 'MEDIUM'
  },
  camera: {
    title: '📹 Camera Access',
    explanation: 'This extension can access your webcam.',
    risk: 'CRITICAL - Could record video without your knowledge',
    severity: 'CRITICAL'
  },
  microphone: {
    title: '🎤 Microphone Access',
    explanation: 'This extension can access your microphone.',
    risk: 'CRITICAL - Could record audio without your knowledge',
    severity: 'CRITICAL'
  },
  management: {
    title: '⚙️ Extension Management',
    explanation: 'This extension can manage other extensions.',
    risk: 'Could disable security extensions or install malware',
    severity: 'CRITICAL'
  },
  debugger: {
    title: '🐛 Debugger Access',
    explanation: 'This extension can debug and manipulate other extensions and apps.',
    risk: 'Extremely powerful - can intercept and modify any extension behavior',
    severity: 'CRITICAL'
  },
  proxy: {
    title: '🔀 Proxy Control',
    explanation: 'This extension can control proxy settings.',
    risk: 'Could route traffic through malicious servers',
    severity: 'HIGH'
  },
  webNavigation: {
    title: '🧭 Web Navigation Tracking',
    explanation: 'This extension can track your page navigations and URL changes.',
    risk: 'Can monitor all page transitions in detail',
    severity: 'HIGH'
  },
  downloads: {
    title: '📥 Download Access',
    explanation: 'This extension can download files and access download history.',
    risk: 'Could download malicious files or expose download activity',
    severity: 'HIGH'
  },
  privacy: {
    title: '🔐 Privacy Settings',
    explanation: 'This extension can modify browser privacy settings.',
    risk: 'Could weaken privacy protections',
    severity: 'HIGH'
  },
  identity: {
    title: '🆔 Identity Access',
    explanation: 'This extension can access your identity information and OAuth tokens.',
    risk: 'Could access authentication tokens for linked accounts',
    severity: 'HIGH'
  },
  bookmarks: {
    title: '🔖 Bookmark Access',
    explanation: 'This extension can access and modify your bookmarks.',
    risk: 'Can read all bookmarks and potentially redirect saved links',
    severity: 'HIGH'
  },
  notifications: {
    title: '🔔 Notification Access',
    explanation: 'This extension can show desktop notifications.',
    risk: 'Could be used for social engineering or phishing attempts',
    severity: 'MEDIUM'
  },
  unlimitedStorage: {
    title: '💿 Unlimited Storage',
    explanation: 'This extension can store unlimited data locally.',
    risk: 'Unusual requirement - could be used for data exfiltration staging',
    severity: 'MEDIUM'
  },
  activeTab: {
    title: '🔲 Active Tab Access',
    explanation: 'This extension can access the active tab when you click its icon.',
    risk: 'Limited access - only active tab on click',
    severity: 'LOW'
  },
  storage: {
    title: '💾 Storage Access',
    explanation: 'This extension can store data locally using Chrome storage API.',
    risk: 'Generally safe - standard extension functionality',
    severity: 'LOW'
  },
  contextMenus: {
    title: '📋 Context Menu Access',
    explanation: 'This extension can add items to the right-click context menu.',
    risk: 'Generally safe - common functionality',
    severity: 'MEDIUM'
  }
};

/**
 * Group similar findings together and deduplicate
 */
function groupFindings(findings: RawFinding[]): Map<string, { count: number; files: Set<string>; finding: RawFinding }> {
  const grouped = new Map<string, { count: number; files: Set<string>; finding: RawFinding }>();

  findings.forEach((finding) => {
    if (finding.type === 'info') return; // Skip info messages

    // Create a key based on type and pattern/permission
    let key = '';
    if (finding.type === 'code-pattern') {
      key = `code-${finding.pattern}`;
    } else if (finding.type === 'permission' || finding.type === 'host-permission') {
      key = `perm-${finding.permission}`;
    } else {
      key = finding.type;
    }

    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.count++;
      if (finding.file) {
        existing.files.add(finding.file);
      }
    } else {
      grouped.set(key, {
        count: 1,
        files: finding.file ? new Set([finding.file]) : new Set(),
        finding
      });
    }
  });

  return grouped;
}

/**
 * Convert raw findings to user-friendly grouped findings
 */
function convertToGroupedFindings(rawFindings: RawFinding[]): {
  critical: GroupedFinding[];
  high: GroupedFinding[];
  medium: GroupedFinding[];
  low: GroupedFinding[];
} {
  const grouped = groupFindings(rawFindings);
  const result = {
    critical: [] as GroupedFinding[],
    high: [] as GroupedFinding[],
    medium: [] as GroupedFinding[],
    low: [] as GroupedFinding[]
  };

  grouped.forEach(({ count, files, finding }) => {
    let groupedFinding: GroupedFinding | null = null;

    if (finding.type === 'code-pattern' && finding.pattern) {
      const explanation = PATTERN_EXPLANATIONS[finding.pattern];
      if (explanation) {
        groupedFinding = {
          category: 'Code Pattern',
          severity: finding.severity,
          title: explanation.title,
          explanation: explanation.explanation,
          files: Array.from(files),
          count,
          icon: '⚠️'
        };
      }
    } else if (finding.type === 'permission' && finding.permission) {
      const explanation = PERMISSION_EXPLANATIONS[finding.permission];
      if (explanation) {
        groupedFinding = {
          category: 'Permission Risk',
          severity: finding.severity,
          title: explanation.title,
          explanation: `${explanation.explanation}\n\nRisk: ${explanation.risk}`,
          count,
          icon: '🔒'
        };
      }
    } else if (finding.type === 'host-permission') {
      groupedFinding = {
        category: 'Host Permissions',
        severity: finding.severity,
        title: '🌐 Broad Site Access',
        explanation:
          'This extension has access to many or all websites. It can read and modify data on these sites.',
        count,
        icon: '⛔'
      };
    } else if (finding.type === 'deprecated') {
      groupedFinding = {
        category: 'Deprecated Features',
        severity: finding.severity,
        title: '⏰ Outdated Manifest Version',
        explanation: 'This extension uses Manifest V2, which is deprecated and will stop working soon. Update to V3.',
        count,
        icon: '⚠️'
      };
    } else if (finding.type === 'content-script') {
      groupedFinding = {
        category: 'Content Script Injection',
        severity: finding.severity,
        title: '💉 Broad Content Script Injection',
        explanation: finding.description,
        count,
        icon: '⛔'
      };
    } else if (finding.type === 'csp') {
      groupedFinding = {
        category: 'Content Security Policy',
        severity: finding.severity,
        title: `🛡️ CSP Issue: ${finding.value || 'Unknown'}`,
        explanation: finding.description,
        count,
        icon: '⚠️'
      };
    } else if (finding.type === 'sensitive-domain') {
      groupedFinding = {
        category: 'Sensitive Domain Access',
        severity: finding.severity,
        title: '🏦 Access to Sensitive Domains',
        explanation: finding.description,
        count,
        icon: '⚠️'
      };
    } else if (finding.type === 'permission-combo') {
      groupedFinding = {
        category: 'Dangerous Permission Combination',
        severity: finding.severity,
        title: '🔗 Dangerous Permission Combo',
        explanation: finding.description,
        count,
        icon: '⛔'
      };
    }

    if (groupedFinding) {
      if (groupedFinding.severity === 'critical') {
        result.critical.push(groupedFinding);
      } else if (groupedFinding.severity === 'high') {
        result.high.push(groupedFinding);
      } else if (groupedFinding.severity === 'medium') {
        result.medium.push(groupedFinding);
      } else {
        result.low.push(groupedFinding);
      }
    }
  });

  return result;
}

/**
 * Generate recommendations based on findings
 */
function generateRecommendations(
  findings: RawFinding[],
  score: number
): string[] {
  const recommendations: string[] = [];

  const hasCritical = findings.some((f) => f.severity === 'critical');
  const hasEval = findings.some((f) => f.pattern === 'eval-usage');
  const hasHardcodedCreds = findings.some((f) => f.pattern === 'hardcoded-credentials');
  const hasInsecureHttp = findings.some((f) => f.pattern === 'insecure-http');

  if (hasCritical) {
    recommendations.push('⛔ DO NOT INSTALL - Critical security issues detected');
  } else if (score < 30) {
    recommendations.push('⚠️ HIGH RISK - Reconsider installing this extension');
  } else if (score < 50) {
    recommendations.push('⚠️ CAUTION - Review permissions before installing');
  } else if (score < 75) {
    recommendations.push('✅ Generally safe - Common permissions for this type of extension');
  } else {
    recommendations.push('✅ LOW RISK - Appears to be a secure extension');
  }

  if (hasEval) {
    recommendations.push('Consider reaching out to the developer about removing eval() usage');
  }

  if (hasHardcodedCreds) {
    recommendations.push('Avoid using this extension with sensitive credentials');
  }

  if (hasInsecureHttp) {
    recommendations.push('Request the developer to use HTTPS for all communications');
  }

  return recommendations;
}

/**
 * Determine overall risk level
 */
function determineRiskLevel(
  score: number,
  findings: RawFinding[]
): {
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  description: string;
} {
  const hasCritical = findings.some((f) => f.severity === 'critical');

  if (hasCritical || score === 0) {
    return { level: 'CRITICAL', description: 'Multiple critical security issues detected' };
  } else if (score < 25) {
    return { level: 'HIGH', description: 'Significant security concerns' };
  } else if (score < 50) {
    return { level: 'MEDIUM', description: 'Some security issues to consider' };
  } else if (score < 75) {
    return { level: 'LOW', description: 'Minor security considerations' };
  } else {
    return { level: 'SAFE', description: 'No major security issues detected' };
  }
}

/**
 * Main function: Convert raw findings to user-friendly report
 */
export function formatFindingsForUsers(
  rawFindings: RawFinding[],
  score: number
): UserFriendlyReport {
  // Remove info messages
  const importantFindings = rawFindings.filter((f) => f.type !== 'info');

  const categories = convertToGroupedFindings(importantFindings);
  const { level: overallRisk, description } = determineRiskLevel(score, importantFindings);
  const recommendations = generateRecommendations(importantFindings, score);

  const totalIssues = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);

  return {
    overallRisk,
    riskScore: score,
    riskPercentage: Math.round((100 - score) / 1.25), // Convert 0-100 to percentage
    summary: description,
    categories,
    totalIssues,
    recommendations
  };
}