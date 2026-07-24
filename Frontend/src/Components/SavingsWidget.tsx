import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { PiggyBank, TrendingUp } from "lucide-react";

interface SavingsWidgetProps {
  isDark: boolean;
}

const SavingsWidget = ({ isDark }: SavingsWidgetProps) => {
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [monthSaved, setMonthSaved] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const res = await api.get("/savings/summary");
        if (res.data.success) {
          setTotalSaved(parseFloat(res.data.totalSaved) || 0);
          setMonthSaved(parseFloat(res.data.monthSaved) || 0);
        }
      } catch (error) {
        console.error("Error fetching savings data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavings();
  }, []);

  if (loading) {
    return (
      <div
        className={`rounded-2xl p-4 border-2 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-9 h-9 rounded-full animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          />
          <div
            className={`h-4 w-24 rounded animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          />
        </div>
        <div
          className={`h-8 w-20 rounded animate-pulse mb-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        />
        <div
          className={`h-3 w-32 rounded animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        />
      </div>
    );
  }

  const hasSavings = totalSaved > 0;

  return (
    <div
      className={`rounded-2xl p-4 border-2 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${hasSavings ? "bg-emerald-500/20" : isDark ? "bg-gray-700" : "bg-gray-100"}`}
        >
          <PiggyBank
            size={18}
            className={
              hasSavings
                ? "text-emerald-500"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
            }
          />
        </div>
        <div>
          <h3
            className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Total Savings
          </h3>
          <p
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Est. cost minus actual cost
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span
          className={`text-2xl font-bold ${hasSavings ? "text-emerald-500" : isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          ${totalSaved.toFixed(2)}
        </span>
      </div>

      {monthSaved > 0 && (
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-emerald-400" />
          <span
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            <span className="text-emerald-400 font-semibold">
              +${monthSaved.toFixed(2)}
            </span>{" "}
            saved this month
          </span>
        </div>
      )}

      {!hasSavings && (
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Complete notes with actual costs lower than estimated to see savings
        </p>
      )}
    </div>
  );
};

export default SavingsWidget;
