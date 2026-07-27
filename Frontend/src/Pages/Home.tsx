import { useAuth } from "../Context/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Plus,
  ShoppingCart,
  Pizza,
  Zap,
  CircleDashed,
  Shell,
  Bitcoin,
  Landmark,
  DollarSign,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ChartBar,
  UserCircle,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useDarkMode from "../Components/Mode.tsx";
import MarketWidget from "../Components/MarketWidget.tsx";
import MarketSearch from "../Components/MarketSearch.tsx";
import MarketChartWidget from "../Components/MarketChartWidget.tsx";
import analyzeVideo from "../Videos/VIdeoAnalyzer.mp4";
import compariseVideo from "../Videos/VideoCompariser.mp4";
import AINoteCreater from "../Videos/CreateNoteWithAi.mp4";
import { useEffect, useState } from "react";

interface MarketData {
  crypto: {
    symbol: string;
    name: string;
    price: number;
    changePercent24h: number;
  }[];
  stocks: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }[];
  forex: {
    pair: string;
    rate: number;
    changePercent: number;
  }[];
  commodities: {
    name: string;
    symbol: string;
    price: number;
    changePercent24h: number;
  }[];
}

const Home = () => {
  const { user } = useAuth();
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<{
    symbol: string;
    name: string;
    type: "stock" | "crypto" | "forex" | "commodity";
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetch("/API/market/all")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setMarketData(data.data);
        })
        .catch(() => {});
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const scrollToFeatures = () => {
    document
      .getElementById("create-with-ai")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAssetSelect = (
    symbol: string,
    name: string,
    type: "stock" | "crypto" | "forex" | "commodity",
  ) => {
    setSelectedAsset({ symbol, name, type });
    // Scroll to chart widget
    document
      .querySelector("[data-chart-widget]")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (user) {
    return (
      <div className="px-4 sm:px-8 lg:px-12 py-6 space-y-6">
        {/* Welcome + Search */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
            Welcome back,{" "}
            <span className="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              {user.name}
            </span>
          </h1>
          <p className="text-default-500 text-sm sm:text-base">
            Track global markets, compare your expenses, and manage your
            finances in one place.
          </p>
          <MarketSearch onSelect={setSelectedAsset} isDark={isDark} />
        </div>

        {/* Chart Widget (always visible, shows placeholder when no asset selected) */}
        <div data-chart-widget>
          <MarketChartWidget
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            isDark={isDark}
          />
        </div>

        {/* Widget Grid — dense masonry-style, full width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Crypto — col-span-2 (wider, 3 items) */}
          <div className="lg:col-span-2">
            <MarketWidget
              title="Crypto Market"
              icon={<Bitcoin className="w-4 h-4 text-orange-500" />}
              lastUpdated={marketData ? "Updated just now" : "Loading..."}
            >
              <div className="space-y-2">
                {marketData?.crypto?.length ? (
                  marketData.crypto.map((coin) => (
                    <div
                      key={coin.symbol}
                      onClick={() =>
                        handleAssetSelect(coin.symbol, coin.name, "crypto")
                      }
                      className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-500/10 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <span className="text-xs font-extrabold text-orange-400">
                            {coin.symbol.slice(0, 3)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">
                            {coin.name}
                          </span>
                          <p className="text-xs text-default-400">
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(coin.price)}
                        </p>
                        <p
                          className={`text-xs flex items-center gap-1 ${
                            coin.changePercent24h >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {coin.changePercent24h >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {coin.changePercent24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="h-4 w-20 bg-default-200 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-default-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MarketWidget>
          </div>

          {/* Stocks — col-span-2 (wider, 3 items) */}
          <div className="lg:col-span-2">
            <MarketWidget
              title="Stock Market"
              icon={<ChartBar className="w-4 h-4 text-blue-500" />}
              lastUpdated={marketData ? "Updated just now" : "Loading..."}
            >
              <div className="space-y-2">
                {marketData?.stocks?.length ? (
                  marketData.stocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() =>
                        handleAssetSelect(stock.symbol, stock.name, "stock")
                      }
                      className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-500/10 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <span className="text-xs font-extrabold text-blue-400">
                            {stock.symbol.slice(0, 3)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">
                            {stock.name}
                          </span>
                          <p className="text-xs text-default-400">
                            {stock.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(stock.price)}
                        </p>
                        <p
                          className={`text-xs flex items-center gap-1 ${
                            stock.changePercent >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {stock.changePercent >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="h-4 w-20 bg-default-200 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-default-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MarketWidget>
          </div>

          {/* Forex — col-span-1 (compact, 4 pairs) */}
          <div className="lg:row-span-2">
            <MarketWidget
              title="Forex Rates"
              icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
              lastUpdated={marketData ? "Updated just now" : "Loading..."}
            >
              <div className="space-y-1.5">
                {marketData?.forex?.length ? (
                  marketData.forex.map((fx) => (
                    <div
                      key={fx.pair}
                      onClick={() =>
                        handleAssetSelect(fx.pair, fx.pair, "forex")
                      }
                      className="flex items-center justify-between py-2 border-b border-divider last:border-0 cursor-pointer hover:bg-gray-500/10 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <span className="font-semibold text-sm">{fx.pair}</span>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {fx.rate.toFixed(4)}
                        </p>
                        <p
                          className={`text-xs ${
                            fx.changePercent >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {fx.changePercent >= 0 ? "+" : ""}
                          {fx.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-divider last:border-0"
                      >
                        <div className="h-4 w-14 bg-default-200 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-default-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MarketWidget>
          </div>

          {/* Commodities — col-span-1, row-span-2 (tall, 3 items with bigger cards) */}
          <div className="lg:row-span-2">
            <MarketWidget
              title="Gold & Metals"
              icon={<Coins className="w-4 h-4 text-yellow-500" />}
              lastUpdated={marketData ? "Updated just now" : "Loading..."}
            >
              <div className="space-y-3">
                {marketData?.commodities?.length ? (
                  marketData.commodities.map((comm) => (
                    <div
                      key={comm.symbol}
                      onClick={() =>
                        handleAssetSelect(comm.symbol, comm.name, "commodity")
                      }
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                        isDark
                          ? "bg-gray-700 border-gray-600 hover:border-primary/30"
                          : "bg-default-100 border-default-300 hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{comm.name}</span>
                        <span className="text-xs text-default-400">
                          {comm.symbol}
                        </span>
                      </div>
                      <p className="text-xl font-extrabold">
                        {formatPrice(comm.price)}
                      </p>
                      <p
                        className={`text-sm flex items-center gap-1 mt-1 ${
                          comm.changePercent24h >= 0
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {comm.changePercent24h >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {comm.changePercent24h.toFixed(2)}% (24h)
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-default-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-4 w-12 bg-default-200 rounded animate-pulse" />
                          <div className="h-3 w-8 bg-default-200 rounded animate-pulse" />
                        </div>
                        <div className="h-7 w-24 bg-default-200 rounded animate-pulse mb-1" />
                        <div className="h-4 w-20 bg-default-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MarketWidget>
          </div>

          {/* Compare Notes — col-span-2 (stretched horizontally) */}
          <div className="lg:col-span-2">
            <MarketWidget
              title="Compare Your Expenses"
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              onClick={() => navigate("/Compare")}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-default-500 leading-relaxed mb-3">
                    Side-by-side AI-powered comparison of your expenses. Find
                    which store gives you better deals and save more money.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      AI-Powered
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
                      Real-time Insights
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                      Save Money
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/Compare");
                  }}
                  className="shrink-0 px-6 py-3 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Compare Now →
                </button>
              </div>
            </MarketWidget>
          </div>
        </div>
      </div>
    );
  }

  const text1 =
    "Our AI instantly scans your receipts and extracts key information. No more manual entry - just snap a photo and let FloWealth do the rest. Track prices, compare stores, and never miss a detail.";
  const text2 =
    "Side-by-side comparison of your spending notes. See which store offers better prices, track estimation accuracy, and make smarter shopping decisions based on real data.";

  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Floating shapes - glow entrance animation */}

        <div className="absolute pointer-events-none top-0 left-0 w-[200px] h-[500px] md:top-[-100px] md:left-[-50px] md:w-[500px] md:h-[500px] rounded-full bg-primary/40 md:bg-primary/50 blur-[60px] md:blur-[100px] animate-glow-enter" />

        <div className="absolute pointer-events-none top-0 right-0 w-[250px] h-[250px] md:top-[15%] md:right-[-80px] md:w-[400px] md:h-[400px] rounded-full bg-secondary/40 md:bg-secondary/50 blur-[50px] md:blur-[80px] animate-glow-enter-delayed" />

        <div className="absolute pointer-events-none bottom-0 left-0 w-[250px] h-[250px] md:top-[40%] md:left-[5%] md:w-[250px] md:h-[250px] rounded-full bg-primary/30 md:bg-primary/30 blur-[50px] md:blur-[60px] animate-glow-enter" />

        <div className="absolute pointer-events-none bottom-0 right-0 w-[350px] h-[400px] md:bottom-[30%] md:right-[10%] md:w-[350px] md:h-[350px] rounded-full bg-secondary/30 md:bg-secondary/40 blur-[60px] md:blur-[90px] animate-glow-enter-delayed" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center"
        >
          <div className="relative inline-block ">
            <div className="absolute inset-3 pt-12 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
            </div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-black mb-6 
              bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent 
              drop-shadow-[0_0_40px_rgba(206,150,19,0.6)]"
          >
            FloWealth
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl  max-w-xl mx-auto mb-8 Roboto-slab"
          >
            Track your expenses effortlessly with AI-powered receipt scanning.
            Get instant insights and compare your spending habits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 justify-center"
          >
            <div className="flex gap-4">
              <Link to="/Account">
                <button className="cursor-pointer px-8 py-3 bg-linear-to-r from-primary to-secondary text-white font-bold rounded-xl hover:scale-105 transition-transform">
                  Get Started
                </button>
              </Link>
              <button
                onClick={scrollToFeatures}
                className="cursor-pointer px-8 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors"
              >
                Learn More
              </button>
            </div>
            <ArrowDown className="w-10 h-10 " />
          </motion.div>
        </motion.div>
      </section>

      {/* AI SCANNER SEPARATOR */}

      <div className="relative pb-16 pt-5 overflow-hidden flex items-center justify-center">
        <motion.div
          className="pointer-events-none absolute left-0 top-1/2 h-[2px] w-[35%] -translate-y-1/2 bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0"
          animate={{ x: ["-20%", "20%", "-20%"], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-0 top-1/2 h-[2px] w-[35%] -translate-y-1/2 bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0"
          animate={{ x: ["20%", "-20%", "20%"], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* core */}
        <div className="relative w-24 h-24">
          {/* glow */}
          <div className="absolute inset-0 rounded-full bg-primary/25 blur-[22px]" />

          {/* pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/35"
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-3 rounded-full border border-secondary/30"
            animate={{ scale: [1.05, 0.92, 1.05], opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* orbiting sparkles */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <CircleDashed className="w-12 h-12 text-primary/35" />
            </div>
          </motion.div>

          {/* center zap (locked dead-center) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 0, 2, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        </div>
      </div>
      <section id="create-with-ai" className="py-20 relative">
        <div className="absolute pointer-events-none top-4 left-0 w-[400px] h-[400px] rounded-full bg-primary/30 blur-[100px] animate-glow-enter" />
        <div className="absolute pointer-events-none bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-secondary/35 blur-[90px] animate-glow-enter-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-secondary/20 blur-[80px] animate-glow-enter" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.7fr_1fr] gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative col-span-1"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold text-primary uppercase tracking-wild Archivo-Black tracking-wide">
                  Prompt
                </span>
              </div>
              <div
                className="relative bg-gradient-to-br from-primary/20 to-secondary backdrop-blur-sm
              rounded-3xl p-6 border"
              >
                <div className="invisible lg:visible absolute -right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[16px] border-l-primary" />
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-sm font-mono text-gray-700 dark:text-gray-200 leading-relaxed"
                >
                  {" "}
                  Get me 2 gallons of milk for $5, a large pizza for $12, and 3
                  loaves of bread for $4.
                </motion.p>
              </div>

              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-0 -right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 " />
              </motion.div>
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-7 -left-3 w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg"
              >
                <Pizza className="w-5 h-5 " />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative rounded-2xl shadow-2xl col-"
            >
              <div className="absolute -inset-[3px] bg-gradient-to-br from-primary to-secondary rounded-2xl" />
              <div className="relative bg-gray-900 aspect-video  flex items-center justify-center overflow-hidden rounded-2xl">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={AINoteCreater} type="video/mp4" />
                </video>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40, filter: "blur(6px)", rotate: 1 }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)", rotate: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
                delay: 0.15,
              }}
              className="flex flex-col items-start gap-4"
            >
              <div className="flex items-center gap-3">
                <Shell className="w-12 h-12 text-primary" />
                <h2 className="text-3xl font-black Poetsen-one ">
                  AI suggestion for your shopping
                </h2>
              </div>
              <p className="Roboto-slab text-base sm:text-lg md:text-xl items-center">
                Type what you want to buy, and our AI automatically creates
                detailed expense notes
              </p>
              <div className="flex justify-end w-full">
                <Link
                  to="/Account"
                  className=" gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary
                 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg "
                >
                  Try it now
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* DECORATIVE SEPARATOR 1 */}
      <div className="divider-decoration">
        <div className="divider-line-left" />
        <div className="relative">
          <div className="absolute inset-0 -top-4 bg-primary/30 blur-[30px] rounded-full animate-glow-soft invisible sm:visible" />
          <div className="divider-icon">
            <Plus className="w-4 h-4 text-primary relative z-10" />
          </div>
        </div>
        <div className="divider-line-right" />
      </div>

      {/* FEATURE SECTION 2 - Video left, Text right */}
      <section id="features" className="py-40 relative ">
        {/* Floating shapes - glow entrance animation */}
        <div className="absolute pointer-events-none top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/30 blur-[100px] animate-glow-enter" />
        <div className="absolute pointer-events-none top-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-secondary/30 blur-[80px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none bottom-[20%] left-[10%] w-[150px] h-[150px] rounded-full bg-primary/25 blur-[70px] animate-glow-enter" />
        <div className="absolute pointer-events-none top-[50%] right-[25%] w-[180px] h-[180px] rounded-full bg-secondary/20 blur-[50px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none bottom-0 right-[15%] w-[200px] h-[200px] rounded-full bg-primary/30 blur-[60px] animate-glow-enter" />

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-4 relative "
        >
          {/* Video */}
          <div className="relative rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="absolute -inset-[3px] bg-gradient-to-br from-primary to-secondary rounded-2xl" />
            <div className="relative bg-gray-900 aspect-[16/10] flex items-center justify-center">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={analyzeVideo} type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-black Poetsen-one">
                Real-time AI Analysis
              </h2>
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-wrap gap-x-2 "
            >
              {words1.map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.05,
                        duration: 0.3,
                      },
                    },
                  }}
                  className="Roboto-slab text-base sm:text-lg md:text-xl items-center leading-relaxed"
                >
                  {word}{" "}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* DECORATIVE SEPARATOR 2 - Pulse rings with floating shapes */}
      <div className="separator-wrapper py-10">
        <div className="separator-line" />
        <div className="separator-ring" />
        <div className="separator-ring" />
        <div className="separator-ring" />
        <div className="separator-diamond" />
        <div className="absolute pointer-events-none top-[40%] right-[20%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[30px] animate-float-delayed invisible sm:visible" />
        <div className="absolute pointer-events-none top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-primary/25 blur-[40px] animate-glow-soft invisible sm:visible" />
      </div>

      {/* FEATURE SECTION 2 - Text left, Video right */}
      <section className="py-40 relative overflow-hidden">
        {/* Floating shapes - glow entrance animation */}
        <div className="absolute pointer-events-none top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-secondary/35 blur-[90px] animate-glow-enter" />
        <div className="absolute pointer-events-none bottom-[25%] left-[5%] w-[280px] h-[280px] rounded-full bg-primary/30 blur-[80px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none top-[50%] left-[13%] w-[300px] h-[250px] rounded-full bg-secondary/25 blur-[60px] animate-glow-enter" />
        <div className="absolute pointer-events-none bottom-0 right-[30%] w-[180px] h-[180px] rounded-full bg-primary/20 blur-[50px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none top-[60%] right-[40%] w-[260px] h-[200px] rounded-full bg-secondary/30 blur-[70px] animate-glow-enter" />

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-4 relative "
        >
          {/* Text */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-secondary" />
              <h2 className="text-3xl font-black Poetsen-one">Compare Notes</h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-wrap gap-x-2 "
            >
              {words2.map((word2, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.05,
                        duration: 0.3,
                      },
                    },
                  }}
                  className="Roboto-slab text-base sm:text-lg md:text-xl items-center leading-relaxed"
                >
                  {word2}{" "}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Video */}
          <div className="relative rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="absolute -inset-[3px] bg-gradient-to-br from-primary to-secondary rounded-2xl" />
            <div className="relative bg-gray-900 aspect-[16/10] flex items-center justify-center">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={compariseVideo} type="video/mp4" />
              </video>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DECORATIVE SEPARATOR 3 - Wave with dots */}
      <div className="separator-wrapper py-10">
        <div className="separator-line" />
        <div className="separator-dot" style={{ top: "30%", left: "15%" }} />
        <div className="separator-dot" style={{ top: "50%", left: "35%" }} />
        <div className="separator-dot" style={{ top: "40%", left: "50%" }} />
        <div className="separator-dot" style={{ top: "60%", left: "65%" }} />
        <div className="separator-dot" style={{ top: "30%", right: "15%" }} />
        <div className="absolute pointer-events-none top-[10%] left-[25%] w-[120px] h-[120px] rounded-full bg-primary/15 blur-[50px] animate-glow-soft" />
        <div className="absolute pointer-events-none bottom-[20%] right-[25%] w-[100px] h-[100px] rounded-full bg-secondary/15 blur-[40px] animate-glow" />
        <div className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-secondary/20 blur-[50px] animate-glow-soft invisible sm:visible" />
      </div>

      {/* CTA SECTION */}
      <section className="py-24 relative ">
        {/* Floating shapes around CTA - glow entrance animation */}
        <div className="absolute pointer-events-none top-[20%] left-[10%] w-[450px] h-[350px] rounded-full bg-primary/30 blur-[80px] animate-glow-enter" />
        <div className="absolute pointer-events-none bottom-[30%] right-[5%] w-[500px] h-[400px] rounded-full bg-secondary/25 blur-[90px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none top-[50%] left-[10%] w-[150px] h-[150px] rounded-full bg-primary/20 blur-[50px] animate-glow-enter" />
        <div className="absolute pointer-events-none top-[30%] right-[30%] w-[180px] h-[180px] rounded-full bg-secondary/15 blur-[60px] animate-glow-enter-delayed" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col  items-center text-center relative "
        >
          <motion.div
            initial={{
              scale: 0,
              opacity: 0,
              rotate: 0,
            }}
            whileInView={{
              scale: 1,
              opacity: 1,
              rotate: 360,
            }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              rotate: { duration: 0.8, ease: "easeInOut" },
            }}
            className="relative w-32 h-32 mx-auto mb-6"
          >
            {/* Background glow */}
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-[30px] animate-glow-soft" />

            {/* Rotating ring */}
            <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-rotate-slow" />

            {/* Center icon */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 Poetsen-one">
            Ready to Start Tracking?
          </h2>

          <p className="text-lg max-w-md mx-auto mb-8">
            Create your free account and get instant access to AI-powered
            receipt analysis and smart spending insights.
          </p>
          <Link
            to="/Account"
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-secondary  font-bold rounded-xl hover:scale-105 transition-transform"
          >
            Create Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
