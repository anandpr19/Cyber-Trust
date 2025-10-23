 ## CYBER_TRUST🌐🔒

A simple web app to check the security and privacy hygiene of Chrome extensions. Users can paste a Chrome extension URL and see whether it’s safe to use.

## ✅ Features

Scan Chrome extension by URL.

- Analyze permissions requested by the extension (clipboard, camera, geolocation, etc.).
- Detect insecure network requests (HTTP endpoints).
- Identify use of outdated or weak encryption (MD5, SHA1).
- Highlight storage of sensitive data in insecure ways (LocalStorage, plaintext).
- Assign a Trust Score (0–100) and display green/yellow/red badges.
- Explain each risk in plain English for easy understanding.

## 🎯 Use Case

  **End Users**: Decide which Chrome extensions are safer to install.

 **Companies**: Check internal tools or open-source extensions for security hygiene before deployment.

  **Developers**: Embed a Cyber-Trust badge in README or extension store page.

## 🛠️ How It Works

1. User pastes a Chrome extension URL.

2. The app fetches the extension code (manifest, JS, HTML files).

3. Performs static analysis and security checks.

4. Generates a Trust Score and a report with risks.

## 💻 Tech Stack

**Frontend**: React / HTML + CSS

**Backend**: Node.js or Python (Flask/FastAPI)

**Analysis Libraries**:

  - esprima for JavaScript parsing

  - requests & BeautifulSoup for HTML analysis

  - Custom crypto & permission checks

**TRUST SCORE EXAMPLE**

| Score  | Badge Color | Meaning |
| ------ | ----------- | ------- |
| 80–100 | ✅ Green     | Safe    |
| 50–79  | ⚠️ Yellow   | Caution |
| 0–49   | ❌ Red       | Unsafe  |

## 🔐 Disclaimer

This tool provides security guidance only. It cannot guarantee absolute safety. Always exercise caution when installing extensions.


=============================================

It's currently in the Works, Will keep updating.
