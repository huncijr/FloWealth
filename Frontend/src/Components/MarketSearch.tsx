import { Search, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useDarkMode from "./Mode";

interface SearchItem {
  symbol: string;
  name: string;
  type: string;
  price?: number;
  changePercent?: number;
}

interface MarketSearchProps {
  onResults?: (items: SearchItem[]) => void;
}

const MarketSearch = ({ onResults }: MarketSearchProps) => {
  const { isDark } = useDarkMode();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    async (q: string) => {
      if (q.length < 1) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      try {
        const res = await fetch(
          `/API/market/search?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
          setIsOpen(data.data.length > 0);
          onResults?.(data.data);
        }
      } catch {
        setResults([]);
      }
    },
    [onResults],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full z-30">
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks, crypto, forex, gold, commodities..."
          className={`w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 text-base shadow-md transition-all outline-none ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/20"
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border-2 shadow-2xl overflow-hidden z-50 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="max-h-80 overflow-y-auto p-2">
              {results.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-extrabold text-primary">
                        {item.symbol.slice(0, 4)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.symbol}</p>
                      <p className="text-xs text-default-400 truncate max-w-[200px]">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.type === "stock"
                        ? "bg-blue-500/10 text-blue-500"
                        : item.type === "crypto"
                          ? "bg-orange-500/10 text-orange-500"
                          : "bg-violet-500/10 text-violet-500"
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketSearch;
