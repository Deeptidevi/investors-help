# 📈 AI Investment Research Agent

> An intelligent, full-stack investment research tool powered by **Google Gemini AI** and **real-time Yahoo Finance data**. Enter any company name and get a definitive **INVEST** or **PASS** verdict backed by live market data, a 90-day price chart, and detailed AI-generated analysis — all in under 15 seconds.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-orange?style=for-the-badge&logo=google)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Live Demo:** https://investors-help.vercel.app

---

## 1. Overview — What It Does

The AI Investment Research Agent takes a company name (or ticker symbol) as input and autonomously:

1. **Resolves** the company name to a stock ticker symbol (e.g., "Tesla" → "TSLA")
2. **Fetches** real-time stock data: current price, daily change %, 52-week high/low
3. **Retrieves** 90 days of historical price data and renders an interactive chart
4. **Invokes** Google Gemini AI with the financial data as context
5. **Returns** a structured report containing:
   - A definitive **INVEST** or **PASS** verdict
   - A detailed **Investment Rationale** paragraph
   - Key **Growth Drivers** (bullish highlights)
   - **Risk Factors** (bearish considerations)

Everything runs in one seamless request from the browser to the Next.js backend, with no database, no user accounts, and no stored state — just pure, on-demand AI-powered research.

---

## 2. How to Run It

### Prerequisites
- **Node.js** v18 or later — [Download](https://nodejs.org/)
- A free **Google Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/Deeptidevi/investors-help.git
cd investors-help

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
```

### Environment Variables

Open `.env.local` and add your key:

```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

> ⚠️ `.env.local` is git-ignored. It is NEVER committed to GitHub. Your key stays safe locally.

### Run the Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Deploy to Production (Vercel)

```bash
# Push to GitHub — Vercel auto-deploys on every push
git push origin main
```

Then in **Vercel Dashboard → Settings → Environment Variables**, add:
```
GOOGLE_API_KEY = your_key_here
```

---

## 3. How It Works — Approach & Architecture

### Request Flow

```
User types "Apple" → clicks Research
        │
        ▼
React Frontend (page.tsx)
POST /api/research  { company: "Apple" }
        │
        ▼
Next.js API Route (src/app/api/research/route.ts)
        │
        ▼
Agent Logic (src/lib/agent.ts)  ← Node.js server only
   │
   ├─ Step 1: resolveSymbol("Apple")
   │     ├─ Check COMMON_TICKERS map → "AAPL" ✓
   │     └─ Fallback: Yahoo Finance autocomplete API
   │
   ├─ Step 2: getQuoteAndChart("AAPL")
   │     └─ Yahoo Finance v8 Chart API
   │           Fetches: price, change%, 52w high/low + 90-day OHLCV
   │
   └─ Step 3: Gemini AI Analysis
         └─ POST to generativelanguage.googleapis.com/v1beta
               Prompt includes: company name, ticker, all financials
               Response: { decision, reasoning, highlights, risks }
        │
        ▼
JSON response to frontend
        │
        ▼
ResearchResults.tsx renders:
  - Header: Ticker, Date, Company Name, Price, Verdict
  - Interactive 90-day Area Chart (Recharts)
  - AI Rationale, Growth Drivers, Risk Factors
  - Verdict Guide with expandable INVEST/PASS explanation + disclaimer
```

### File Structure

```
src/
├── app/
│   ├── api/research/route.ts   ← POST /api/research endpoint
│   ├── globals.css             ← Global design tokens (CSS variables)
│   ├── layout.tsx              ← Root HTML + Google Fonts
│   ├── page.tsx                ← Main page + premium loading animation
│   └── page.module.css         ← All scoped CSS (no Tailwind)
├── components/
│   └── ResearchResults.tsx     ← Report card with chart + verdict guide
└── lib/
    └── agent.ts                ← Core agent: Yahoo Finance + Gemini AI
```

---

## 4. Key Decisions & Trade-offs

### ✅ What I Chose & Why

| Decision | Rationale |
|---|---|
| **Next.js App Router** | Unified full-stack in one project — no separate Express server needed. API Routes run on Node.js, React handles the UI. Simpler deploy, simpler mental model. |
| **Direct Google Gemini REST API** (not LangChain) | The `@langchain/google-genai` package had version compatibility issues with the newer `AQ.` format API keys. Switching to a direct `fetch()` call eliminated all library dependency issues and gave full control over the request shape. |
| **Yahoo Finance v8 Chart API** (not yahoo-finance2 npm) | The `yahoo-finance2` npm package was broken in the serverless/Node 18 environment. Direct `fetch()` to Yahoo's undocumented chart API works reliably and returns both quote data and historical prices in one request. |
| **`responseMimeType: "application/json"`** | Asking Gemini to return structured JSON natively removes the need to parse and strip markdown code fences. More reliable than prompt-engineering alone. |
| **Client-side loading animation** | The analysis takes 8–15 seconds. A premium progress-bar + phase-step loader dramatically improves perceived performance and UX without any technical complexity. |
| **Vanilla CSS Modules** | No Tailwind, no CSS-in-JS. Scoped styles, zero runtime overhead, full control over every pixel. |
| **Common tickers lookup table** | For the 30 most-searched companies, symbol resolution is instant (no network call). Reduces latency by ~300ms for popular searches. |

### ❌ What I Left Out & Why

| Left Out | Reason |
|---|---|
| **User authentication** | Out of scope for a research demo — adds significant complexity for no analytical benefit |
| **Persistent history / portfolio tracking** | Would require a database (Postgres/Supabase). Kept the app stateless to simplify architecture and hosting |
| **News sentiment analysis** | Gemini's training data already includes general market sentiment; adding live news scraping would need a paid News API and add latency |
| **Multiple LLM providers** | OpenAI fallback was considered but removed to keep the codebase focused. One provider, done well. |
| **P/E Ratio & Market Cap** | Yahoo's chart API doesn't include these fields. The v10 quote API does, but requires an extra round-trip. Left as "N/A" for now rather than adding latency. |
| **Rate limiting / abuse protection** | No API rate limiter on `/api/research`. Fine for a demo; production would need Redis-based throttling. |

---

## 5. Example Runs

### Run 1 — Tesla (TSLA) → PASS

**Input:** `tesla`

**Output:**
```json
{
  "symbol": "TSLA",
  "quote": {
    "price": 407.76,
    "changePercent": 16.85,
    "name": "Tesla, Inc."
  },
  "decision": "PASS",
  "reasoning": "While Tesla's +16.85% daily surge signals strong momentum, the current price of $407.76 reflects a premium valuation that may not be sustainable given margin pressures from aggressive EV price cuts, increased competition from BYD and legacy automakers, and slowing growth in its core automotive segment. The high volatility makes entry risky at these levels.",
  "highlights": [
    "Dominant EV brand recognition globally",
    "Expanding energy storage and Solar business (Powerwall, Megapack)",
    "Full Self-Driving (FSD) optionality remains a long-term upside catalyst"
  ],
  "risks": [
    "Extremely high valuation multiple relative to traditional auto peers",
    "CEO distraction risk and political controversy affecting brand perception",
    "Intensifying competition from BYD and Chinese EV manufacturers"
  ]
}
```

---

### Run 2 — NVIDIA (NVDA) → INVEST

**Input:** `nvidia`

**Output:**
```json
{
  "symbol": "NVDA",
  "decision": "INVEST",
  "reasoning": "NVIDIA holds a near-monopoly position in AI accelerator chips with its H100 and B100 GPUs. Data center revenue is growing at triple-digit rates driven by hyperscaler demand from Microsoft, Google, Amazon, and Meta. The CUDA software ecosystem creates an enormous switching cost moat. Despite a premium valuation, the growth trajectory justifies long-term accumulation.",
  "highlights": [
    "Dominant AI chip market share with H100/B100 GPU ecosystem",
    "CUDA software moat creates massive developer lock-in",
    "Expanding into autonomous vehicles, robotics, and edge AI"
  ],
  "risks": [
    "US export restrictions to China limiting a major revenue market",
    "Potential for custom silicon from hyperscalers (Google TPU, Amazon Trainium) to erode share"
  ]
}
```

---

### Run 3 — Infosys (INFY) → PASS

**Input:** `infosys`

**Output:**
```json
{
  "symbol": "INFY",
  "decision": "PASS",
  "reasoning": "Infosys faces headwinds from IT spending slowdown in key markets (US, Europe), client discretionary budget cuts, and margin pressure from wage inflation. While fundamentals are solid and the dividend yield is attractive, near-term growth visibility is limited. Better entry points may emerge on further weakness.",
  "highlights": [
    "Established blue-chip IT services company with strong client relationships",
    "Attractive dividend yield offering income stability",
    "Growing GenAI practice with strategic partnerships"
  ],
  "risks": [
    "Declining deal ramp-up velocity due to macro uncertainty",
    "Rupee appreciation risk on USD-denominated revenues"
  ]
}
```

---

## 6. What I Would Improve With More Time

| Improvement | Impact | Effort |
|---|---|---|
| **Add P/E ratio & Market Cap** via Yahoo Finance v10 quote endpoint | Richer AI context → better analysis quality | Low |
| **News sentiment layer** — fetch latest 5 headlines via NewsAPI and include in Gemini prompt | Adds real-world context that pure financials miss | Medium |
| **Historical comparison** — compare current price to 200-day moving average | Better technical context for AI | Low |
| **Multiple company comparison** — research 2–3 companies side by side | Power feature for portfolio builders | High |
| **Streaming response** — stream Gemini tokens to the UI as they arrive | Perceived latency drops from 12s → feels instant | Medium |
| **Save & share reports** — generate a unique URL per report | Enables sharing research with others | High |
| **Rate limiting** on the API route using Redis/Upstash | Production-readiness, abuse prevention | Low |
| **Dark mode** toggle | User preference, aesthetic | Low |
| **Mobile-optimised chart** — better touch interaction on the area chart | Broader device support | Low |

---

## 7. Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Full-stack React framework — frontend + API backend in one |
| **TypeScript** | Type safety across frontend and backend |
| **Google Gemini AI** (`gemini-3.5-flash`) | AI-powered investment analysis via REST API |
| **Yahoo Finance API** (direct fetch) | Real-time stock quotes and 90-day price history |
| **Recharts** | Interactive, animated area chart |
| **Framer Motion** | Smooth UI transitions and verdict guide animation |
| **Lucide React** | Clean, consistent icon set |
| **Vercel** | Zero-config deployment with automatic GitHub integration |

---

## 8. BONUS — LLM Chat Session Transcript

This entire project was built collaboratively with **Antigravity (Google DeepMind AI coding assistant)**. The full conversation transcript — including all debugging sessions, architectural decisions, and code iterations — is included in the ZIP file as:

📄 **`llm_chat_transcript.md`**

Key highlights from the chat session:
- Debugging the `yahoo-finance2` package failure → replaced with direct Yahoo Finance fetch
- Identifying that `@langchain/google-genai` v0.0.19 had compatibility issues with new `AQ.` format API keys → switched to direct Gemini REST API
- Running the ListModels API to find available model names in the current environment
- Iterating on the loading animation from static spinner → emoji steps → premium minimal UI
- Adding the Verdict Guide component after user feedback that PASS/INVEST was ambiguous

---

## 9. Project Setup Quick Reference

```bash
git clone https://github.com/Deeptidevi/investors-help.git
cd investors-help
npm install
echo "GOOGLE_API_KEY=your_key_here" > .env.local
npm run dev
# → Open http://localhost:3000
```

---

> ⚠️ **Disclaimer:** This tool is for **educational and informational purposes only**. It does not constitute financial advice. Always conduct your own research before making investment decisions.

---

**Author:** Deeptidevi | [GitHub](https://github.com/Deeptidevi) | [Live App](https://investors-help.vercel.app)
