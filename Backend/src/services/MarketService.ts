const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "";
const FINNHUB_BASE = "https://finnhub.io/api/v1";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// In-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  changePercent24h: number;
}

export interface ForexQuote {
  pair: string;
  rate: number;
  changePercent: number;
}

export interface CommodityQuote {
  name: string;
  symbol: string;
  price: number;
  changePercent24h: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: "stock" | "crypto" | "forex" | "commodity";
  price?: number;
  changePercent?: number;
}

// ========== STOCKS (Finnhub) ==========
const TOP_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
];

export async function getStockQuotes(): Promise<StockQuote[]> {
  const cached = getCached<StockQuote[]>("stocks");
  if (cached) return cached;

  try {
    const quotes = await Promise.all(
      TOP_STOCKS.map(async ({ symbol, name }) => {
        const res = await fetch(
          `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
        );
        const data = await res.json();
        return {
          symbol,
          name,
          price: data.c ?? 0,
          change: data.d ?? 0,
          changePercent: data.dp ?? 0,
        };
      }),
    );
    setCache("stocks", quotes);
    return quotes;
  } catch {
    return cached || [];
  }
}

// ========== FOREX (Finnhub) ==========
const FOREX_PAIRS = [
  { pair: "EUR/USD", symbol: "EUR_USD" },
  { pair: "GBP/USD", symbol: "GBP_USD" },
  { pair: "USD/JPY", symbol: "USD_JPY" },
  { pair: "USD/CHF", symbol: "USD_CHF" },
];

export async function getForexRates(): Promise<ForexQuote[]> {
  const cached = getCached<ForexQuote[]>("forex");
  if (cached) return cached;

  try {
    // Use frankfurter.app (free, no API key needed)
    // Get latest rates with USD as base
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CHF",
    );
    const data = await res.json();

    if (!data.rates) {
      return cached || [];
    }

    const result: ForexQuote[] = FOREX_PAIRS.map(({ pair }) => {
      const parts = pair.split("/");
      const base = parts[0] ?? "";
      const quote = parts[1] ?? "";

      let displayRate: number;
      if (base === "USD") {
        // USD/JPY, USD/CHF → direct rate from frankfurter
        displayRate = data.rates[quote] ?? 0;
      } else {
        // EUR/USD, GBP/USD → inverse: USD per 1 unit
        const usdPerUnit = data.rates[base] ?? 0;
        displayRate = usdPerUnit > 0 ? 1 / usdPerUnit : 0;
      }

      return {
        pair,
        rate: Math.round(displayRate * 10000) / 10000,
        changePercent: 0,
      };
    });

    setCache("forex", result);
    return result;
  } catch {
    return cached || [];
  }
}

// ========== CRYPTO (CoinGecko) ==========
const CRYPTO_IDS = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
};

export async function getCryptoPrices(): Promise<CryptoQuote[]> {
  const cached = getCached<CryptoQuote[]>("crypto");
  if (cached) return cached;

  try {
    const ids = Object.keys(CRYPTO_IDS).join(",");
    const res = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    );
    const data = await res.json();

    const result: CryptoQuote[] = Object.entries(CRYPTO_IDS).map(
      ([id, symbol]) => ({
        symbol,
        name: symbol,
        price: data[id]?.usd ?? 0,
        changePercent24h: data[id]?.usd_24h_change ?? 0,
      }),
    );
    setCache("crypto", result);
    return result;
  } catch {
    return cached || [];
  }
}

// ========== COMMODITIES (CoinGecko) ==========
const COMMODITY_IDS: Record<string, { name: string; symbol: string }> = {
  "pax-gold": { name: "Gold", symbol: "XAU" },
  "tether-gold": { name: "Gold (XAUT)", symbol: "XAUT" },
  "platinum-coin": { name: "Platinum", symbol: "XPT" },
};

export async function getCommodities(): Promise<CommodityQuote[]> {
  const cached = getCached<CommodityQuote[]>("commodities");
  if (cached) return cached;

  try {
    const ids = Object.keys(COMMODITY_IDS).join(",");
    // CoinGecko has tokens that track precious metals
    // PAXG for gold, but silver/platinum may not be available
    // Fallback: use simple price for available tokens
    const res = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    );
    const data = await res.json();

    const result: CommodityQuote[] = Object.entries(COMMODITY_IDS)
      .filter(([id]) => data[id])
      .map(([id, { name, symbol }]) => ({
        name,
        symbol,
        price: data[id]?.usd ?? 0,
        changePercent24h: data[id]?.usd_24h_change ?? 0,
      }));
    setCache("commodities", result);
    return result;
  } catch {
    return cached || [];
  }
}

// ========== SEARCH (Finnhub) ==========
export async function searchMarket(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_KEY}`,
    );
    const data = await res.json();

    const results: SearchResult[] = (data.result || [])
      .slice(0, 8)
      .map((item: any) => ({
        symbol: item.symbol,
        name: item.description || item.symbol,
        type: "stock",
      }));

    setCache(cacheKey, results);
    return results;
  } catch {
    return cached || [];
  }
}

// ========== ALL-IN-ONE ==========
export async function getAllMarketData() {
  const [crypto, stocks, forex, commodities] = await Promise.all([
    getCryptoPrices(),
    getStockQuotes(),
    getForexRates(),
    getCommodities(),
  ]);

  return { crypto, stocks, forex, commodities };
}
