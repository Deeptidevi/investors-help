// Using native fetch for Gemini REST API to ensure compatibility with API keys and models

// ─── Yahoo Finance Direct API Client ─────────────────────────────────────────
// Replaces the broken yahoo-finance2 npm package with direct fetch calls.

const YAHOO_BASE = "https://query1.finance.yahoo.com";

// Common ticker mappings to avoid needing a search API call
const COMMON_TICKERS: Record<string, string> = {
  tesla: "TSLA", apple: "AAPL", google: "GOOGL", alphabet: "GOOGL",
  microsoft: "MSFT", amazon: "AMZN", meta: "META", facebook: "META",
  nvidia: "NVDA", netflix: "NFLX", amd: "AMD", intel: "INTC",
  disney: "DIS", walmart: "WMT", jpmorgan: "JPM", visa: "V",
  mastercard: "MA", paypal: "PYPL", adobe: "ADBE", salesforce: "CRM",
  uber: "UBER", airbnb: "ABNB", spotify: "SPOT", ibm: "IBM",
  oracle: "ORCL", cisco: "CSCO", boeing: "BA", nike: "NKE",
  "coca-cola": "KO", pepsi: "PEP", starbucks: "SBUX", toyota: "TM",
  sony: "SONY", reliance: "RELIANCE.NS", tata: "TCS.NS", infosys: "INFY",
  wipro: "WIPRO.NS", hdfc: "HDFCBANK.NS",
};

async function yahooFetch(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yahoo API error (${res.status}): ${text.substring(0, 200)}`);
  }

  return res.json();
}

async function resolveSymbol(company: string): Promise<string> {
  // Check common tickers first
  const lower = company.trim().toLowerCase();
  if (COMMON_TICKERS[lower]) return COMMON_TICKERS[lower];

  // If it looks like a ticker already (short, all caps, no spaces), use it directly
  if (company.length <= 6 && /^[A-Z0-9.\-]+$/i.test(company) && !company.includes(" ")) {
    return company.toUpperCase();
  }

  // Try Yahoo's autosuggest API (more reliable than the search endpoint)
  try {
    const url = `https://query2.finance.yahoo.com/v6/finance/autocomplete?query=${encodeURIComponent(company)}&lang=en`;
    const data = await yahooFetch(url);
    const results = data?.ResultSet?.Result;
    if (results && results.length > 0) {
      return results[0].symbol;
    }
  } catch (e) {
    console.warn("Autocomplete API failed, trying as ticker symbol directly");
  }

  return company.toUpperCase();
}

interface QuoteData {
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  trailingPE: number | null;
  marketCap: number | null;
  shortName: string;
}

interface ChartPoint {
  date: string;
  price: number;
}

async function getQuoteAndChart(symbol: string): Promise<{ quote: QuoteData; chartData: ChartPoint[] }> {
  // Use the v8 chart API — it returns both quote data and historical prices in one call
  const now = Math.floor(Date.now() / 1000);
  const threeMonthsAgo = now - 90 * 24 * 60 * 60;

  const url = `${YAHOO_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${threeMonthsAgo}&period2=${now}&interval=1d&includePrePost=false`;
  const data = await yahooFetch(url);

  const result = data?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No data found for symbol "${symbol}". Check the company name or ticker.`);
  }

  const meta = result.meta;
  const timestamps: number[] = result.timestamp || [];
  const closes: number[] = result.indicators?.quote?.[0]?.close || [];

  // Build chart data
  const chartData: ChartPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) {
      const d = new Date(timestamps[i] * 1000);
      chartData.push({
        date: d.toISOString().split("T")[0],
        price: parseFloat(closes[i].toFixed(2)),
      });
    }
  }

  // Extract quote data from chart meta
  const quote: QuoteData = {
    regularMarketPrice: meta.regularMarketPrice ?? closes[closes.length - 1] ?? 0,
    regularMarketChangePercent:
      meta.regularMarketPrice && meta.chartPreviousClose
        ? parseFloat((((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100).toFixed(2))
        : 0,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    trailingPE: null, // Not available in chart API
    marketCap: null,  // Not available in chart API
    shortName: meta.shortName || meta.symbol || symbol,
  };

  return { quote, chartData };
}

// ─── Main Analysis Function ──────────────────────────────────────────────────

export async function analyzeCompany(company: string) {
  const geminiKey = process.env.GOOGLE_API_KEY;

  if (!geminiKey) {
    throw new Error("No API key available. Please add GOOGLE_API_KEY to .env.local");
  }

  // 1. Resolve company name to ticker symbol
  const symbol = await resolveSymbol(company);

  // 2. Fetch real-time data from Yahoo Finance
  let quoteData: QuoteData;
  let chartData: ChartPoint[];

  try {
    const result = await getQuoteAndChart(symbol);
    quoteData = result.quote;
    chartData = result.chartData;
  } catch (error: any) {
    console.error("Yahoo Finance Error:", error);
    throw new Error(`Failed to fetch financial data for ${company}. Error: ${error?.message || error}`);
  }
  // 3. Generate Analysis using Google Gemini REST API
  const promptText = `
    You are an expert AI Investment Research Analyst.
    Your task is to analyze the company '${company}' (Ticker: ${symbol}) and make a definitive decision on whether to INVEST or PASS.
    
    Here is the real-time financial data for the company:
    Current Price: ${quoteData.regularMarketPrice}
    Daily Change: ${quoteData.regularMarketChangePercent}%
    52 Week High: ${quoteData.fiftyTwoWeekHigh || "N/A"}
    52 Week Low: ${quoteData.fiftyTwoWeekLow || "N/A"}
    PE Ratio: ${quoteData.trailingPE || "N/A"}
    Market Cap: ${quoteData.marketCap || "N/A"}
    
    Consider their market position, recent news, the provided financials, and future outlook.
    
    Respond ONLY with a valid JSON object matching this exact schema:
    {
      "decision": "INVEST" or "PASS",
      "reasoning": "A detailed paragraph explaining your rationale based on the financials and market.",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "risks": ["risk 1", "risk 2"]
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError: any;
      try {
        parsedError = JSON.parse(errorText);
      } catch (e) {}
      const details = parsedError?.error?.message || errorText;
      throw new Error(`Gemini API error (Status ${response.status}): ${details}`);
    }

    const resJson = await response.json();
    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response returned from Gemini API");
    }

    const aiAnalysis = JSON.parse(rawText.trim());

    return {
      symbol,
      quote: {
        price: quoteData.regularMarketPrice,
        changePercent: quoteData.regularMarketChangePercent,
        marketCap: quoteData.marketCap,
        peRatio: quoteData.trailingPE,
        name: quoteData.shortName || company,
      },
      chartData,
      ...aiAnalysis,
    };
  } catch (error: any) {
    console.error("LLM Analysis Error:", error);
    throw new Error(`Failed to analyze company using AI. Details: ${error?.message || error}`);
  }
}
