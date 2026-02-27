<div align="center">

# 🔒 Cyber-Trust

### Chrome Extension Security Analyzer

Analyze Chrome extensions for security risks, dangerous permissions, and potential threats — directly from a Chrome Web Store URL.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **URL-Based Analysis** | Paste a Chrome Web Store URL or extension ID — no manual downloads needed |
| 🛡️ **23-Point Permission Scan** | Detects risky permissions with severity ratings (critical/high/medium/low) |
| 🤖 **AI-Powered TLDR** | Google Gemini generates a plain-English risk summary |
| 📊 **Public Dashboard** | See recently analyzed extensions, risk distribution, and scan stats |
| 🔍 **Code Pattern Detection** | Finds `eval()`, hardcoded credentials, `innerHTML`, and insecure HTTP |
| 🧩 **CSP & Content Script Analysis** | Checks for `unsafe-eval`, content script injection, and sensitive domains |
| 🔗 **Embedded URL Extraction** | Discovers all URLs hidden inside extension source files |
| 💾 **Scan Caching** | 24-hour cache prevents redundant scans and saves API quota |
| 🌓 **Light & Dark Themes** | Toggle between themes with persistent preference |
| 📜 **Raw Manifest Viewer** | Collapsible, syntax-highlighted manifest.json with copy button |

## 🖥️ Two-Audience Results View

- **Simple View** — Trust score circle, TLDR, plain-English permissions ("Can read your browsing history"), clear recommendation
- **Stats for Nerds** — Full findings tabs, permissions breakdown, embedded URLs, raw manifest JSON

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite 7 |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB (Mongoose) |
| **AI** | Google Gemini API |
| **Scraping** | Cheerio (Chrome Web Store metadata) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### 1. Clone

```bash
git clone https://github.com/anandpr19/Cyber-Trust.git
cd Cyber-Trust
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=4001
MONGO_URI=mongodb://localhost:27017/cyber-trust
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend/cyber_trust
npm install
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend/cyber_trust && npm run dev
```

Visit **http://localhost:3000** and paste any Chrome extension URL to analyze.

---

## 📂 Project Structure

```
Cyber-Trust/
├── backend/
│   └── src/
│       ├── controllers/      # scanController, uploadController, dashboardController
│       ├── models/            # Extension (Mongoose schema)
│       ├── routes/            # scan, upload, dashboard routes
│       ├── services/          # analyzer, policyEngine, aiAnalyzer, chromeStoreScraper
│       └── server.ts          # Express server with CORS, rate limiting
├── frontend/
│   └── cyber_trust/
│       └── src/
│           ├── components/    # Header, Footer, FindingCard, SimpleView, DetailedView
│           ├── contexts/      # ThemeContext (dark/light toggle)
│           ├── hooks/         # useAnalysis, useLocalStorage
│           ├── pages/         # HomePage, UploadPage, ResultsPage, DashboardPage
│           ├── services/      # API client
│           └── types/         # TypeScript interfaces
└── README.md
```

---

## 🔒 Security

- **Rate limiting** on all endpoints (scan: 5/min, upload: 10/hr, dashboard: 30/min)
- **CORS** restricted via `CORS_ORIGIN` environment variable
- **AI analysis** fails gracefully when API quota is exceeded
- **No secrets** stored in code — all via environment variables

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ for browser security</p>
</div>
