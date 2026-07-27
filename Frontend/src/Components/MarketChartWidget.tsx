import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  timestamp: number;
  price: number;
}

interface SelectedAsset {
  symbol: string;
  name: string;
  type: "stock" | "crypto" | "forex" | "commodity";
}

interface MarketChartWidgetProps {
  asset: SelectedAsset | null;
  onClose?: () => void;
  isDark?: boolean;
}

const RANGES = ["1W", "1M", "3M", "1Y"] as const;
type Range = (typeof RANGES)[number];

export default function MarketChartWidget({
  asset,
  onClose,
  isDark = false,
}: MarketChartWidgetProps) {
  const [range, setRange] = useState<Range>("1M");
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/API/market/chart?symbol=${encodeURIComponent(asset.symbol)}&type=${asset.type}&name=${encodeURIComponent(asset.name)}&range=${range}`,
      );
      const json = await res.json();
      if (json.success && json.data?.prices) {
        setData(json.data.prices);
      } else {
        setError("No data available");
        setData([]);
      }
    } catch {
      setError("Failed to load chart");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [asset, range]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  const formatPrice = (value: number) => {
    if (value >= 1000) return `$${value.toLocaleString()}`;
    if (value >= 1) return `$${value.toFixed(2)}`;
    return `$${value.toFixed(4)}`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    if (range === "1W") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const prices = data.map((d) => d.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const priceChange =
    prices.length >= 2 ? prices[prices.length - 1]! - prices[0]! : 0;
  const priceChangePercent =
    prices.length >= 2 && prices[0] !== 0
      ? ((prices[prices.length - 1]! - prices[0]!) / prices[0]!) * 100
      : 0;
  const isPositive = priceChange >= 0;

  return (
    <div
      className={`rounded-2xl border-2 p-5 ${
        isDark ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
              isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"
            }`}
          >
            {asset?.symbol?.slice(0, 4).toUpperCase() || "?"}
          </div>
          <div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}
            >
              {asset?.name || "No asset selected"}
            </h3>
            <span
              className={`text-xs uppercase ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {asset
                ? `${asset.symbol} · ${asset.type}`
                : "Select from search or click a widget item"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  range === r
                    ? isDark
                      ? "bg-blue-500 text-white"
                      : "bg-blue-500 text-white"
                    : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Price summary */}
      {data.length > 0 && (
        <div className="flex items-baseline gap-3 mb-4">
          <span
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}
          >
            {formatPrice(prices[prices.length - 1]!)}
          </span>
          <span
            className={`text-sm font-semibold ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)} ({isPositive ? "+" : ""}
            {priceChangePercent.toFixed(2)}%)
          </span>
          <span
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {range}
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-[250px] w-full">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Loading chart...
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-sm text-red-400">{error}</div>
          </div>
        )}
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#e5e7eb"}
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                domain={[minPrice * 0.995, maxPrice * 1.005]}
                tickFormatter={formatPrice}
                tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={70}
                dx={-4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#fff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "12px",
                  fontSize: "13px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                labelFormatter={(ts: any) =>
                  new Date(ts).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
                formatter={(value: any) =>
                  [formatPrice(Number(value)), "Price"] as [string, string]
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: isPositive ? "#22c55e" : "#ef4444",
                  stroke: isDark ? "#1f2937" : "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        {!loading && !error && data.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Select an asset to view chart
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
