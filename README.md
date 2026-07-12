# 📈 AI Investment Research Agent

> An intelligent, full-stack investment research tool powered by **Google Gemini AI** and **real-time Yahoo Finance data**. Enter any company name and get a definitive **INVEST** or **PASS** verdict backed by live market data, a price chart, and detailed AI-generated analysis.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=google)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🖥️ Live Demo

![App Screenshot](https://i.imgur.com/placeholder.png)
> Type a company like **Tesla**, **Apple**, or **NVDA** and get a full AI-powered investment report in seconds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Analysis** | Google Gemini generates a detailed investment rationale |
| 📊 **Live Price Chart** | 90-day historical price chart via Yahoo Finance |
| ⚡ **Real-Time Data** | Current price, daily % change, 52-week high/low, P/E ratio |
| ✅ **INVEST / PASS Verdict** | Clear, definitive decision on every query |
| 🌍 **Global Stocks** | Supports US, Indian (NSE/BSE), and international tickers |
| 🧠 **Smart Symbol Resolution** | Type a company name — auto-resolves to the correct ticker |
| 📱 **Responsive Design** | Works beautifully on desktop and mobile |

---

## 🏗️ Project Architecture

```
investors-help/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── research/
│   │   │       └── route.ts        ← Backend API endpoint (POST /api/research)
│   │   ├── globals.css             ← Global styles
│   │   ├── layout.tsx              ← Root HTML layout
│   │   ├── page.tsx                ← Main frontend page (React)
│   │   └── page.module.css         ← Scoped CSS for the main page
│   │
│   ├── components/
│   │   └── ResearchResults.tsx     ← Results card with chart and AI analysis
│   │
│   └── lib/
│       └── agent.ts                ← Core logic: Yahoo Finance + Gemini AI (server-only)
│
├── .env.example                    ← Template for environment variables
├── .gitignore                      ← Protects secrets and build files
├── next.config.mjs                 ← Next.js config
├── package.json
└── tsconfig.json
```

### How It Works (Request Flow)

```
User types "Tesla" → Clicks Research
        ↓
  React UI (page.tsx)
        ↓ POST /api/research { company: "Tesla" }
  Next.js API Route (route.ts)
        ↓
  Agent Logic (agent.ts)  ← Runs on Node.js server only
     ├── Resolves "Tesla" → "TSLA" (ticker)
     ├── Fetches 90-day price chart from Yahoo Finance
     └── Sends data to Google Gemini for AI analysis
        ↓
  Returns JSON { decision, reasoning, highlights, risks, chartData, quote }
        ↓
  ResearchResults.tsx renders the report
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later — [Download](https://nodejs.org/)
- A **Google Gemini API Key** (free) — [Get one here](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/Deeptidevi/investors-help.git
cd investors-help
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then open `.env.local` and add your Gemini API key:

```env
GOOGLE_API_KEY="your_google_gemini_api_key_here"
```

> ⚠️ **Never commit `.env.local` to Git.** It is already listed in `.gitignore` to keep your key safe.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app is ready!

---

## 🔑 Getting a Free Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and paste it into your `.env.local` file as `GOOGLE_API_KEY`

> The free tier is generous enough for personal and development use.

---

## 🌐 Supported Companies & Tickers

You can search by **company name** or **ticker symbol**:

| Input | Resolves To |
|---|---|
| `Tesla` | `TSLA` |
| `Apple` | `AAPL` |
| `NVIDIA` | `NVDA` |
| `Reliance` | `RELIANCE.NS` |
| `Infosys` | `INFY` |
| `MSFT` | `MSFT` (used directly) |

The app uses Yahoo Finance's autocomplete API to resolve any company name worldwide.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Full-stack React framework |
| **TypeScript** | Type-safe code |
| **Google Gemini AI** | AI-powered investment analysis |
| **Yahoo Finance API** | Real-time stock data & price history |
| **Recharts** | Interactive price charts |
| **Framer Motion** | Smooth UI animations |
| **Lucide React** | Clean icon set |

---

## 📦 Key Scripts

```bash
npm run dev       # Start development server on localhost:3000
npm run build     # Build for production
npm run start     # Run the production build
npm run lint      # Lint the codebase
```

---

## 🔒 Security Notes

- `.env.local` is **git-ignored** — your API key is never pushed to GitHub.
- The `src/lib/agent.ts` file runs **only on the server** (Node.js). The browser never has access to your API key.
- Yahoo Finance requests are made from the server, not the browser, to avoid CORS issues.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it.

---

## 👩‍💻 Author

**Deeptidevi** — [GitHub](https://github.com/Deeptidevi)

---

> ⚠️ **Disclaimer**: This tool is for **educational and informational purposes only**. It does not constitute financial advice. Always do your own research before making any investment decisions.
