import { Search, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  symbol: string;
  name: string;
  type: "stock" | "crypto" | "forex" | "commodity";
  price?: number;
  changePercent?: number;
}

interface MarketSearchProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  isDark?: boolean;
}

export default function MarketSearch({
  onSelect,
  placeholder,
  isDark = false,
}: MarketSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/API/market/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data || []);
        setIsOpen((data.data || []).length > 0);
      }
    } catch {
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "stock":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-500/20 text-blue-400">
            STOCK
          </span>
        );
      case "crypto":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-orange-500/20 text-orange-400">
            CRYPTO
          </span>
        );
      case "forex":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-green-500/20 text-green-400">
            FOREX
          </span>
        );
      case "commodity":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-yellow-500/20 text-yellow-400">
            COMMODITY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-violet-500/20 text-violet-400">
            {type.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search
          size={16}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search stocks, crypto, forex..."}
          className={`w-full pl-9 pr-9 py-2.5 rounded-xl border-2 text-sm outline-none transition-colors ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
              : "bg-white border-gray-200 text-black placeholder-gray-400 focus:border-blue-500"
          }`}
        />
        {query && (
          <button
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-full rounded-xl border-2 shadow-xl overflow-hidden ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {isLoading && (
              <div
                className={`px-4 py-3 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Searching...
              </div>
            )}
            {results.map((result, idx) => (
              <button
                key={`${result.symbol}-${idx}`}
                onClick={() => handleSelect(result)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isDark
                    ? "hover:bg-gray-700/50 text-white"
                    : "hover:bg-gray-100 text-black"
                } ${idx < results.length - 1 ? (isDark ? "border-b border-gray-700/50" : "border-b border-gray-100") : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {result.symbol.slice(0, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {result.name}
                  </div>
                  <div className="text-xs text-gray-500">{result.symbol}</div>
                </div>
                <div className="flex items-center gap-2">
                  {result.price != null && (
                    <span className="text-sm font-medium">
                      ${result.price.toLocaleString()}
                    </span>
                  )}
                  {getTypeBadge(result.type)}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
