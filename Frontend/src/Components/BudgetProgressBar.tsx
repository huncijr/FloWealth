import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { DollarSign, Target } from "lucide-react";

interface BudgetProgressBarProps {
  isDark: boolean;
  refreshTrigger?: number;
}

const BudgetProgressBar = ({
  isDark,
  refreshTrigger,
}: BudgetProgressBarProps) => {
  const [budget, setBudget] = useState<number | null>(null);
  const [spent, setSpent] = useState<number>(0);
  const [showInput, setShowInput] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBudgetData = async () => {
    try {
      const [budgetRes, spentRes] = await Promise.all([
        api.get("/budget"),
        api.get("/spending/current-month"),
      ]);
      if (budgetRes.data.success && budgetRes.data.budget) {
        setBudget(parseFloat(budgetRes.data.budget));
      }
      if (spentRes.data.success) {
        setSpent(parseFloat(spentRes.data.totalSpent) || 0);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [refreshTrigger]);

  const handleSetBudget = async () => {
    const amount = parseFloat(budgetInput);
    if (!amount || amount <= 0) return;

    try {
      const now = new Date();
      const res = await api.post("/budget", {
        budget: amount,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      if (res.data.success) {
        setBudget(amount);
        setBudgetInput("");
        setShowInput(false);
      }
    } catch (error) {
      console.error("Error setting budget:", error);
    }
  };

  const percentage =
    budget && budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget ? Math.max(budget - spent, 0) : 0;
  const isOverBudget = budget ? spent > budget : false;

  const barColor = isOverBudget
    ? "bg-red-500"
    : percentage > 75
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div
      className={`rounded-2xl p-4 border-2 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target
            size={18}
            className={isOverBudget ? "text-red-500" : "text-emerald-500"}
          />
          <h3
            className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Monthly Budget
          </h3>
        </div>
        {!loading && !budget && !showInput && (
          <button
            onClick={() => setShowInput(true)}
            className={`text-xs px-3 py-1 rounded-full border ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
          >
            Set Budget
          </button>
        )}
        {!loading && budget && (
          <button
            onClick={() => setShowInput(!showInput)}
            className={`text-xs px-3 py-1 rounded-full border ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
          >
            {showInput ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {showInput && (
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <DollarSign
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            />
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Enter budget..."
              className={`w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none transition
                ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500"
                }`}
            />
          </div>
          <button
            onClick={handleSetBudget}
            disabled={!budgetInput}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition
              ${
                budgetInput
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : `${isDark ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"} cursor-not-allowed`
              }`}
          >
            Save
          </button>
        </div>
      )}

      {loading ? (
        <div
          className={`h-2 rounded-full animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        />
      ) : budget ? (
        <>
          {/* Custom Progress Bar */}
          <div
            className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>
              Spent:{" "}
              <span
                className={`font-semibold ${isOverBudget ? "text-red-400" : isDark ? "text-white" : "text-gray-800"}`}
              >
                ${spent.toFixed(2)}
              </span>
            </span>
            <span
              className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              ${budget.toFixed(2)}
            </span>
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>
              Left:{" "}
              <span
                className={`font-semibold ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}
              >
                ${remaining.toFixed(2)}
              </span>
            </span>
          </div>
          {isOverBudget && (
            <p className="text-xs text-red-400 mt-1 font-medium">
              Over budget!
            </p>
          )}
        </>
      ) : (
        <p
          className={`text-xs text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          Set a monthly budget to track your spending
        </p>
      )}
    </div>
  );
};

export default BudgetProgressBar;
