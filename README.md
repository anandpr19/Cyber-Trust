# Cyber-Trust 🌐🔒

A web application to analyze Chrome extension security. Upload a `.crx` file and get instant insights on permissions, code vulnerabilities, and risk factors.

## What It Does

- **Permission Analysis** - See exactly what data each extension can access
- **Code Scanning** - Detects eval(), hardcoded credentials, weak encryption, insecure APIs
- **Trust Score** - Get a 0-100 security rating with color-coded badges
- **Plain English** - No tech jargon, just clear explanations of what's risky and why

## How to Use

1. Go to the **Analyze** page
2. Drag & drop a `.crx` file (or click to browse)
3. Get instant analysis with detailed findings
4. Review recommendations before installing

### Getting a .crx File

Use the [CRXExtractor](https://chromewebstore.google.com/detail/crxextractor/cnchibnhjmccagmccadflmphloijjojf) extension to download `.crx` files from Chrome Web Store.

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite for bundling
- Tailwind CSS
- React Router

**Backend:**
- Node.js + Express
- TypeScript
- Mongoose (MongoDB)
- Axios for downloads

**Analysis:**
- AdmZip for extraction
- Custom regex patterns for vulnerability detection
- Permission risk mapping

## Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB (optional - falls back to in-memory mode)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/cyber-trust
NODE_ENV=development
```

Run development server:
```bash
npm run dev
```

Server runs at `http://localhost:4000`

### Frontend Setup

```bash
cd frontend/cyber_trust
npm install
```

Run development server:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000` (automatically proxies API to `:4000`)

### Build for Production

Backend:
```bash
npm run build
npm start
```

Frontend:
```bash
npm run build
```

## API Routes

### POST `/api/upload`
Upload a `.crx` file for analysis.

**Request:**
```bash
curl -F "file=@extension.crx" http://localhost:4000/api/upload
```

**Response:**
```json
{
  "success": true,
  "extensionId": "abc123...",
  "name": "Google Translate",
  "version": "1.0.0",
  "report": {
    "overallRisk": "LOW",
    "riskScore": 72,
    "summary": "Minor security considerations",
    "categories": { ... },
    "recommendations": [ ... ]
  }
}
```

### GET `/api/health`
Check API status and database connection.

```bash
curl http://localhost:4000/api/health
```

## How the Analysis Works

1. **Extract** - Convert CRX format to ZIP and extract files
2. **Parse Manifest** - Read `manifest.json` for permissions
3. **Scan Code** - Check all JavaScript/HTML files for risky patterns
4. **Score** - Deduct points for each risk found (starts at 100)
5. **Report** - Group findings by severity and generate recommendations

### Risk Scoring

| Score | Risk Level | What It Means |
|-------|-----------|---------------|
| 80-100 | 🟢 Safe | No major issues detected |
| 50-79 | 🟡 Low | Minor permissions or patterns to review |
| 25-49 | 🔴 Medium | Several risks worth considering |
| 0-24 | 🔴 High | Significant security concerns |

### What We Check

**Permissions:**
- Camera, microphone (critical)
- History, cookies, clipboard (high risk)
- Web request, geolocation (medium risk)
- Tabs, management (varies)

**Code Patterns:**
- `eval()` usage
- Hardcoded credentials (passwords, API keys)
- Unencrypted HTTP connections
- Weak crypto (MD5, SHA1)
- localStorage for sensitive data

**Deprecated:**
- Manifest V2 (Chrome dropping support)

## Limitations

⚠️ **This tool provides guidance only, not guarantees.**

- Only performs **static analysis** (doesn't run the extension)
- Can't detect obfuscated or encrypted malicious code
- Missing runtime behavior analysis
- Always do your own research on unfamiliar extensions

## Project Status

🚀 **MVP complete** - Core functionality working

### Upcoming
- PDF report downloads
- Batch scanning
- Version history tracking
- Browser extension for Chrome Web Store integration

## Contributing

Found an issue or have an idea? [Open an issue](https://github.com/anandpr19/Cyber-Trust/issues) or submit a PR.

## License

MIT - See LICENSE file

---

**Disclaimer:** This tool is for educational and informational purposes. Always exercise caution when installing extensions, regardless of what any tool says.
