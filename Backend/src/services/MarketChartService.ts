const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "";
const FINNHUB_BASE = "https://finnhub.io/api/v1";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// Cache for chart data (shorter TTL since prices change)
const cache = new Map<string, { data: any; timestamp: number }>();
const CHART_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CHART_CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export interface ChartDataPoint {
  timestamp: number; // Unix ms
  price: number;
}

interface RangeConfig {
  days: number;
  resolution: string;
}

// Range to days mapping
const RANGE_MAP: Record<string, RangeConfig> = {
  "1W": { days: 7, resolution: "60" },
  "1M": { days: 30, resolution: "D" },
  "3M": { days: 90, resolution: "D" },
  "1Y": { days: 365, resolution: "W" },
};

const DEFAULT_RANGE: RangeConfig = RANGE_MAP["1M"]!;

export interface ChartResponse {
  symbol: string;
  name: string;
  type: "stock" | "crypto" | "forex" | "commodity";
  prices: ChartDataPoint[];
}

// ========== STOCK CHART (Finnhub) ==========
async function getStockChart(
  symbol: string,
  range: string,
): Promise<ChartDataPoint[]> {
  const r: RangeConfig = RANGE_MAP[range] ?? DEFAULT_RANGE;
  const now = Math.floor(Date.now() / 1000);
  const from = now - r.days * 24 * 60 * 60;

  try {
    const res = await fetch(
      `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${r.resolution}&from=${from}&to=${now}&token=${FINNHUB_KEY}`,
    );
    const data = await res.json();

    if (data.s !== "ok" || !data.t) return [];

    return data.t.map((t: number, i: number) => ({
      timestamp: t * 1000,
      price: data.c[i] ?? 0,
    }));
  } catch {
    return [];
  }
}

// ========== CRYPTO CHART (CoinGecko) ==========
const CRYPTO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

async function getCryptoChart(
  symbol: string,
  range: string,
): Promise<ChartDataPoint[]> {
  const r: RangeConfig = RANGE_MAP[range] ?? DEFAULT_RANGE;
  const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${r.days}`,
    );
    const data = await res.json();

    if (!data.prices) return [];

    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch {
    return [];
  }
}

// ========== FOREX CHART (frankfurter timeseries) ==========
async function getForexChart(
  pair: string,
  range: string,
): Promise<ChartDataPoint[]> {
  const r: RangeConfig = RANGE_MAP[range] ?? DEFAULT_RANGE;
  const parts = pair.split("/");
  const base = parts[0] || "EUR";
  const quote = parts[1] || "USD";

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - r.days);

  const start = startDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const end = endDate.toISOString().split("T")[0];

  try {
    const res = await fetch(
      `https://api.frankfurter.app/${start}..${end}?from=${base}&to=${quote}`,
    );
    const data = await res.json();

    if (!data.rates) return [];

    const prices: ChartDataPoint[] = [];
    // Sort dates ascending
    const dates = Object.keys(data.rates).sort();
    for (const date of dates) {
      const rate = data.rates[date]?.[quote];
      if (rate) {
        prices.push({
          timestamp: new Date(date).getTime(),
          price: rate,
        });
      }
    }
    return prices;
  } catch {
    return [];
  }
}

// ========== COMMODITY CHART (CoinGecko) ==========
const COMMODITY_ID_MAP: Record<string, string> = {
  XAU: "pax-gold",
  XAUT: "tether-gold",
  XPT: "platinum-coin",
};

async function getCommodityChart(
  symbol: string,
  range: string,
): Promise<ChartDataPoint[]> {
  const r: RangeConfig = RANGE_MAP[range] ?? DEFAULT_RANGE;
  const coinId = COMMODITY_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${r.days}`,
    );
    const data = await res.json();

    if (!data.prices) return [];

    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch {
    return [];
  }
}

// ========== MAIN EXPORT ==========
export async function getChartData(
  symbol: string,
  type: "stock" | "crypto" | "forex" | "commodity",
  name: string,
  range: string = "1M",
): Promise<ChartResponse> {
  const cacheKey = `chart:${type}:${symbol}:${range}`;
  const cached = getCached<ChartResponse>(cacheKey);
  if (cached) return cached;

  let prices: ChartDataPoint[] = [];

  switch (type) {
    case "stock":
      prices = await getStockChart(symbol, range);
      break;
    case "crypto":
      prices = await getCryptoChart(symbol, range);
      break;
    case "forex":
      prices = await getForexChart(symbol, range);
      break;
    case "commodity":
      prices = await getCommodityChart(symbol, range);
      break;
  }

  const result: ChartResponse = { symbol, name, type, prices };
  setCache(cacheKey, result);
  return result;
}
