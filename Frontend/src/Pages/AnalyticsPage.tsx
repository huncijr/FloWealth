import { useEffect, useMemo, useState } from "react";
import useDarkMode from "../Components/Mode";
import { useAuth } from "../Context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CheckCircleIcon,
  Menu,
  Palette,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useNotes } from "../Context/Notescontext";
import { useThemes, type Theme } from "../Context/ThemeContext";
import AnalyticChart from "../Components/AnalyticChart";
import SkeletonLoading from "../Components/SkeletonLoading";
import { Button, Card } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

type ThemeWithVirtual = Theme & { isVirtual?: boolean };

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { isDark } = useDarkMode();
  const navigate = useNavigate();

  const [issidebaropen, setIsSidebarOpen] = useState(false);
  const [hasFetchedLocally, setHasFetchedLocally] = useState(false);
  const [localNote, setLocalNote] = useState<{
    title: string;
    products: { name: string; quantity: number; estprice: number }[];
    totalCost: number;
    savedAt: string;
  } | null>(null);
  const [showCreateAccountOverlay, setShowCreateAccountOverlay] =
    useState(false);

  const { themes, refreshThemes, isloading: themesLoading } = useThemes();
  const { notes, refreshNotes, isloading: notesLoading } = useNotes();

  // Fetch once on mount
  useEffect(() => {
    if (hasFetchedLocally) return;
    setHasFetchedLocally(true);
    refreshThemes();
    refreshNotes();

    // Check localStorage for tutorial note
    const stored = localStorage.getItem("floWealthTutorialNote");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalNote(parsed);
      } catch {
        setLocalNote(null);
      }
    }
  }, [hasFetchedLocally, refreshThemes, refreshNotes]);

  // Show create account overlay 5s after localNote is set
  useEffect(() => {
    if (!user && localNote) {
      const timer = setTimeout(() => setShowCreateAccountOverlay(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [user, localNote]);

  const isloading = notesLoading || themesLoading;

  const completedNotes = useMemo(
    () => notes.filter((n) => n.completed),
    [notes],
  );

  // Summary calculations
  const summaryStats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthNotes = completedNotes.filter((n) => {
      const d = new Date(n.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const totalSpent = completedNotes.reduce(
      (sum, n) => sum + (Number(n.cost) || Number(n.estcost) || 0),
      0,
    );

    const totalEstimated = completedNotes.reduce(
      (sum, n) => sum + (Number(n.estcost) || 0),
      0,
    );

    const totalSavings = totalEstimated - totalSpent;

    const monthSpent = thisMonthNotes.reduce(
      (sum, n) => sum + (Number(n.cost) || Number(n.estcost) || 0),
      0,
    );

    const monthEstimated = thisMonthNotes.reduce(
      (sum, n) => sum + (Number(n.estcost) || 0),
      0,
    );

    const monthSavings = monthEstimated - monthSpent;

    return {
      totalSpent,
      totalEstimated,
      totalSavings,
      totalCount: completedNotes.length,
      monthSpent,
      monthEstimated,
      monthSavings,
      monthCount: thisMonthNotes.length,
    };
  }, [completedNotes]);

  // Monthly trend data for LineChart
  const monthlyTrendData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const now = new Date();

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      months[key] = 0;
    }

    completedNotes.forEach((n) => {
      const d = new Date(n.createdAt);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (months[key] !== undefined) {
        months[key] += Number(n.cost) || Number(n.estcost) || 0;
      }
    });

    return Object.entries(months).map(([month, spent]) => ({
      month,
      spent: Math.round(spent * 100) / 100,
    }));
  }, [completedNotes]);

  // Average line for trend chart
  const trendAvg =
    monthlyTrendData.length > 0
      ? monthlyTrendData.reduce((s, d) => s + d.spent, 0) /
        monthlyTrendData.length
      : 0;

  // Savings percentage for RadialBarChart
  const savingsPercent = useMemo(() => {
    if (summaryStats.monthEstimated <= 0) return 0;
    const pct = (summaryStats.monthSavings / summaryStats.monthEstimated) * 100;
    return Math.round(pct);
  }, [summaryStats.monthSavings, summaryStats.monthEstimated]);

  // Top 3 most expensive completed notes
  const topNotes = useMemo(() => {
    return [...completedNotes]
      .sort((a, b) => {
        const costA = Number(a.cost) || Number(a.estcost) || 0;
        const costB = Number(b.cost) || Number(b.estcost) || 0;
        return costB - costA;
      })
      .slice(0, 3);
  }, [completedNotes]);

  const handleNavigateToExpenses = () => {
    navigate("/Expenses");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  // Sidebar data: group completed notes by theme, and inject virtual "No theme " if needed
  const sidebarThemes = useMemo(() => {
    const noThemeNotes = notes.filter(
      (n) => n.completed && n.theme === "No theme ",
    );

    const allThemes: ThemeWithVirtual[] = [
      ...(noThemeNotes.length > 0
        ? [
            {
              id: 0,
              name: "No theme ",
              color: "#9ca3af",
              isVirtual: true,
            } as ThemeWithVirtual,
          ]
        : []),
      ...themes,
    ];

    return allThemes;
  }, [notes, themes]);

  if (isloading) {
    return (
      <div className="pt-10 w-full">
        <SkeletonLoading />
      </div>
    );
  }

  if (!user) {
    // Guest user with localStorage tutorial note → show demo chart + CTA
    if (localNote) {
      const totalCost = localNote.totalCost || 0;
      const productCount = localNote.products.length;

      const COLORS = [
        "#3b82f6",
        "#8b5cf6",
        "#06b6d4",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#ec4899",
        "#84cc16",
        "#f97316",
        "#6366f1",
      ];

      const donutData = localNote.products.map((p) => ({
        name: p.name,
        value: (p.estprice || 0) * (p.quantity || 1),
      }));

      return (
        <div className="flex flex-col py-6 sm:py-10 px-4 sm:px-6 w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-reddit-condensed text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight font-extrabold">
              Your Demo Note
            </h1>
            <p className="text-default-500 mt-1 text-sm sm:text-base">
              Here's how your {localNote.title} note looks on a chart
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden">
              <Card.Header className="flex flex-col gap-1 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-default-500 font-reddit-condensed tracking-wide">
                    Total Cost
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl font-extrabold text-default-900 tracking-tight">
                  {formatCurrency(totalCost)}
                </span>
                <span className="text-xs text-default-400 mt-1">
                  {productCount} product{productCount !== 1 ? "s" : ""}
                </span>
              </Card.Header>
            </Card>

            <Card className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden">
              <Card.Header className="flex flex-col gap-1 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-violet-500" />
                  </div>
                  <span className="text-sm text-default-500 font-reddit-condensed tracking-wide">
                    Saved
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl font-extrabold text-default-900 tracking-tight">
                  {new Date(localNote.savedAt).toLocaleDateString()}
                </span>
                <span className="text-xs text-default-400 mt-1">Demo mode</span>
              </Card.Header>
            </Card>

            <Card className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden sm:col-span-2 lg:col-span-1">
              <Card.Header className="flex flex-col gap-1 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-sm text-default-500 font-reddit-condensed tracking-wide">
                    Avg per Product
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">
                  {formatCurrency(totalCost / Math.max(productCount, 1))}
                </span>
                <span className="text-xs text-default-400 mt-1">
                  (estimated)
                </span>
              </Card.Header>
            </Card>
          </div>

          {/* Demo Donut Chart (Recharts) */}
          <Card className="border-2 border-divider bg-content1/80 backdrop-blur-sm mb-8">
            <Card.Header className="flex flex-col items-center gap-4 p-8">
              <h2 className="font-reddit-condensed text-xl font-extrabold text-default-900 tracking-tight">
                Spending by Product
              </h2>
              <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={130}
                      paddingAngle={3}
                      dataKey="value"
                      stroke={isDark ? "#1f2937" : "#fff"}
                      strokeWidth={2}
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label — total cost */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-extrabold text-default-900">
                    {formatCurrency(totalCost)}
                  </span>
                  <span className="text-xs text-default-400 mt-1">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {donutData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs text-default-500">
                      {entry.name} ({formatCurrency(entry.value)})
                    </span>
                  </div>
                ))}
              </div>
            </Card.Header>
          </Card>

          {/* Product breakdown */}
          <div className="mb-8">
            <h3 className="font-reddit-condensed text-xl font-extrabold text-default-900 tracking-tight mb-4">
              Product Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localNote.products.map((p, i) => {
                const colors = [
                  "#3b82f6",
                  "#8b5cf6",
                  "#06b6d4",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#ec4899",
                  "#84cc16",
                  "#f97316",
                  "#6366f1",
                ];
                const value = (p.estprice || 0) * (p.quantity || 1);
                const maxVal = Math.max(
                  ...localNote.products.map(
                    (pr) => (pr.estprice || 0) * (pr.quantity || 1),
                  ),
                  1,
                );
                return (
                  <Card
                    key={i}
                    className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden"
                  >
                    <Card.Header className="flex flex-col gap-3 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: colors[i % colors.length],
                            }}
                          />
                          <span className="font-semibold text-default-900">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-xs text-default-400">
                          x{p.quantity}
                        </span>
                      </div>
                      <span className="text-2xl font-extrabold text-emerald-600">
                        {formatCurrency(value)}
                      </span>
                      <div className="w-full bg-default-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${(value / maxVal) * 100}%` }}
                        />
                      </div>
                    </Card.Header>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA: Create an account to save it! — Fixed overlay, appears 5s after page load */}
          <AnimatePresence>
            {showCreateAccountOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
                onClick={() => setShowCreateAccountOverlay(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 40 }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="relative w-[92%] max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowCreateAccountOverlay(false)}
                    className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                  </button>

                  <div
                    className={`rounded-3xl overflow-hidden shadow-2xl ${
                      isDark
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 px-6 pt-10 pb-12">
                      <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-white/10" />
                      <div className="absolute bottom-4 left-8 w-12 h-12 rounded-full bg-white/8" />
                      <div className="absolute top-8 left-12 w-6 h-6 rounded-full bg-white/15" />
                      <div className="relative flex justify-center mb-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.25,
                          }}
                          className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-lg"
                        >
                          <Sparkles
                            className="w-10 h-10 text-white"
                            strokeWidth={2}
                          />
                        </motion.div>
                      </div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="font-reddit-condensed text-white font-extrabold text-2xl text-center leading-tight"
                      >
                        Create an account
                        <br />
                        to save it!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="text-white/80 text-base text-center mt-2 font-medium tracking-wide"
                      >
                        Don't lose your analytics
                      </motion.p>
                    </div>

                    <div className="px-6 py-6 space-y-4">
                      <p className="text-center text-sm text-default-500">
                        Sign up in seconds and keep all your data safe. Access
                        your charts from any device.
                      </p>
                      <Button
                        size="lg"
                        className="w-full py-5 text-lg font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-110 transition-all rounded-2xl"
                        onClick={() => navigate("/Account")}
                      >
                        <BarChart3 className="w-5 h-5" />
                        Create Free Account
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // No note → empty state
    return (
      <div className="relative flex items-center justify-center min-h-[70vh] px-4 py-10">
        <Card className="card-reveal relative z-10 max-w-lg w-full bg-content1/80 backdrop-blur-sm border-1 border-divider shadow-xl">
          <Card.Header className="flex flex-col items-center gap-6 p-8">
            {/* Icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl" />
              <div className="relative p-6 bg-primary/10 rounded-full">
                <BarChart3 className="w-16 h-16 text-primary" />
              </div>
            </div>

            <h2 className="font-reddit-condensed text-3xl sm:text-4xl font-extrabold text-center tracking-tight">
              Track Your Spending
              <br />
              with Charts
            </h2>

            <p className="text-center text-default-500 max-w-sm leading-relaxed">
              Create a note first to unlock beautiful spending analytics and pie
              charts.
            </p>

            {/* Feature highlights */}
            <div className="w-full space-y-3 p-4 bg-content2/50 rounded-xl border border-divider/30">
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-default-700">
                    Visual Analytics
                  </p>
                  <p className="text-xs text-default-400">
                    Beautiful pie charts & spending breakdowns
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-default-700">
                    Budget & Savings
                  </p>
                  <p className="text-xs text-default-400">
                    Track your spending vs. estimated costs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-default-700">
                    AI-Powered Insights
                  </p>
                  <p className="text-xs text-default-400">
                    Smart receipt analysis & recommendations
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="secondary"
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-reddit-condensed font-semibold text-base py-3 rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
                onClick={() => navigate("/Expenses")}
              >
                <Plus className="w-5 h-5" />
                Create a Note First
              </Button>
            </div>

            <p className="text-xs text-default-400 text-center">
              After creating a note, come back here to view it on a chart!
            </p>
          </Card.Header>
        </Card>
      </div>
    );
  }

  if (completedNotes.length === 0) {
    // Themes exist, but no completed notes
    if (themes.length > 0) {
      return (
        <div className="relative flex items-center justify-center min-h-[60vh] p-8">
          <Card className="card-reveal relative z-10 max-w-md w-full bg-content1/80 backdrop-blur-sm border-1 border-divider shadow-xl">
            <Card.Header className="flex flex-col items-center gap-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-success/30 rounded-full blur-xl" />
                <div className="relative p-6 bg-success/10 rounded-full">
                  <CheckCircleIcon className="w-16 h-16 text-success" />
                </div>
              </div>

              <h2 className="font-reddit-condensed text-3xl font-extrabold text-center tracking-tight">
                No completed notes!
              </h2>

              <p className="text-center text-default-500 max-w-sm leading-relaxed">
                Themes already added but no completed notes. Make a note and
                complete it to analyze your monthly spending!
              </p>

              <div className="flex items-center gap-2 px-4 py-2 bg-content2 rounded-full text-sm">
                <BarChart3 className="w-4 h-4 text-default-400" />
                <span className="text-default-500">
                  {themes.length} themes · 0 notes
                </span>
              </div>

              <div className="w-full p-4 bg-success/5 rounded-lg border border-success/20">
                <p className="text-xs text-default-500 text-center">
                  Complete your notes to unlock spending insights and analytics!
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleNavigateToExpenses}>
                  <Plus /> Create Note
                </Button>
              </div>
            </Card.Header>
          </Card>
        </div>
      );
    }

    // No themes yet
    return (
      <div className="relative flex mt-10 items-center justify-center min-h-[60vh] p-8">
        <Card className="card-reveal relative z-10 max-w-lg w-full bg-content1/80 backdrop-blur-sm border-1 border-divider shadow-xl">
          <Card.Header className="flex flex-col items-center gap-6 p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <div className="relative p-6 bg-primary/10 rounded-full">
                <Palette className="w-16 h-16 text-primary" />
              </div>
            </div>

            <h2 className="font-reddit-condensed text-3xl font-extrabold text-center tracking-tight">
              No themes yet!
            </h2>

            <p className="text-center text-default-500 max-w-sm leading-relaxed">
              Start organizing your expenses by creating your first theme.
            </p>

            <div className="flex items-center gap-2 px-4 py-2 bg-content2 rounded-full text-sm">
              <BarChart3 className="w-4 h-4 text-default-400" />
              <span className="text-default-500">0 themes · 0 notes</span>
            </div>

            <div className="w-full p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-default-500 text-center leading-relaxed">
                Themes help you organize expenses by category, making tracking
                easier!
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleNavigateToExpenses}>
                <Plus />
                Create Theme
              </Button>
            </div>
          </Card.Header>
        </Card>
      </div>
    );
  }

  // ===========================
  // DASHBOARD VIEW (has completed notes)
  // ===========================
  return (
    <div className="flex flex-col py-6 sm:py-10 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="font-reddit-condensed text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight font-extrabold">
          Welcome, {user.name}!
        </h1>
        <p className="text-default-500 mt-1 text-sm sm:text-base">
          Here's your spending overview
        </p>
      </div>

      {/* =========================== */}
      {/* SUMMARY CARDS ROW */}
      {/* =========================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Spent Card */}
        <Card className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden">
          <Card.Header className="flex flex-col gap-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-default-500 font-reddit-condensed tracking-wide">
                Total Spent
              </span>
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-default-900 tracking-tight">
              {formatCurrency(summaryStats.totalSpent)}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-default-400">
                {summaryStats.totalCount} completed note
                {summaryStats.totalCount !== 1 ? "s" : ""}
              </span>
              {summaryStats.totalSavings > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                  <TrendingDown className="w-3 h-3 inline mr-1" />$
                  {summaryStats.totalSavings.toFixed(2)} saved
                </span>
              )}
              {summaryStats.totalSavings < 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium">
                  <TrendingUp className="w-3 h-3 inline mr-1" />$
                  {Math.abs(summaryStats.totalSavings).toFixed(2)} over
                </span>
              )}
            </div>
          </Card.Header>
        </Card>

        {/* This Month Card */}
        <Card className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden">
          <Card.Header className="flex flex-col gap-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-sm text-default-500 font-reddit-condensed tracking-wide">
                This Month
              </span>
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-default-900 tracking-tight">
              {formatCurrency(summaryStats.monthSpent)}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-default-400">
                {summaryStats.monthCount} note
                {summaryStats.monthCount !== 1 ? "s" : ""} this month
              </span>
              {summaryStats.monthSavings > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                  <TrendingDown className="w-3 h-3 inline mr-1" />$
                  {summaryStats.monthSavings.toFixed(2)} saved
                </span>
              )}
              {summaryStats.monthSavings < 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium">
                  <TrendingUp className="w-3 h-3 inline mr-1" />$
                  {Math.abs(summaryStats.monthSavings).toFixed(2)} over
                </span>
              )}
            </div>
          </Card.Header>
        </Card>

        {/* Savings Card */}
        <Card className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden sm:col-span-2 lg:col-span-1">
          <Card.Header className="flex flex-col gap-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  summaryStats.totalSavings >= 0
                    ? "bg-emerald-500/20"
                    : "bg-red-500/20"
                }`}
              >
                <PiggyBank
                  className={`w-5 h-5 ${
                    summaryStats.totalSavings >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                />
              </div>
              <span className="text-sm text-default-500 font-reddit-condensed tracking-wide">
                Total Savings
              </span>
            </div>
            <span
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                summaryStats.totalSavings >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(Math.abs(summaryStats.totalSavings))}
            </span>
            <span className="text-xs text-default-400 mt-1">
              {summaryStats.totalSavings >= 0 ? "Under" : "Over"} budget (
              Estimated: {formatCurrency(summaryStats.totalEstimated)})
            </span>
          </Card.Header>
        </Card>
      </div>

      {/* =========================== */}
      {/* STATISTICS STICKY TOGGLE (top-left, below navbar, follows scroll) */}
      {/* =========================== */}
      <div className="sticky top-4 md:top-5 lg:top-6 z-20 ml-0">
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            {!issidebaropen ? (
              <motion.button
                key="menu"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-colors cursor-pointer shadow-md"
              >
                <Menu size={20} className="text-amber-600" />
                <span className="text-sm font-reddit-condensed font-semibold text-amber-700 dark:text-amber-500">
                  Statistics
                </span>
              </motion.button>
            ) : (
              <>
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setIsSidebarOpen(false)}
                />

                <motion.div
                  key="sidebar"
                  initial={{ x: -350, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -350, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className={`${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } border-r-4 border-b-4 rounded-br-lg rounded-tr-lg shadow-2xl
                    min-h-screen max-h-screen flex flex-col`}
                  style={{
                    width: "clamp(280px, 85vw, 350px)",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    zIndex: 50,
                  }}
                >
                  <div
                    className={`flex items-center justify-between p-6 border-b ${
                      isDark
                        ? "bg-gray-800 border-b-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <h2 className="font-reddit-condensed text-xl font-extrabold text-primary tracking-tight">
                      Statistics
                    </h2>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
                    >
                      <X
                        size={24}
                        className={isDark ? "text-gray-300" : "text-gray-700"}
                      />
                    </button>
                  </div>

                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-8">
                      {sidebarThemes.map((theme, i) => {
                        const themeNotes = theme.isVirtual
                          ? notes.filter(
                              (n) => n.completed && n.theme === "No theme ",
                            )
                          : notes.filter(
                              (n) => n.completed && n.theme === theme.name,
                            );

                        const mostlycosted = themeNotes
                          .map((note) => ({
                            ...note,
                            effectiveCost: note.cost
                              ? parseFloat(note.cost)
                              : parseFloat(note.estcost),
                          }))
                          .sort((a, b) => b.effectiveCost - a.effectiveCost)
                          .slice(0, 3);

                        if (mostlycosted.length === 0) return null;

                        return (
                          <div key={theme.id} className="space-y-4">
                            <div
                              className={`flex items-center justify-center gap-3 ${
                                theme.isVirtual ? "opacity-70" : ""
                              }`}
                            >
                              <div
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: theme.color }}
                              />
                              <h3
                                className={`font-reddit-condensed text-xl font-extrabold tracking-tight ${
                                  theme.isVirtual
                                    ? "text-gray-500"
                                    : "text-primary"
                                }`}
                              >
                                {theme.name}
                              </h3>
                              <span className="text-sm text-gray-500">
                                ({themeNotes.length})
                              </span>
                            </div>

                            <div className="space-y-2">
                              {mostlycosted.map((note) => (
                                <div
                                  key={note.id}
                                  className={`p-4 rounded-lg border-l-4 ${
                                    isDark ? "bg-gray-700/50" : "bg-gray-100"
                                  } ${theme.isVirtual ? "opacity-80" : ""}`}
                                  style={{
                                    borderLeftColor: theme.color,
                                  }}
                                >
                                  <p className="font-medium text-sm">
                                    {note.productTitle}
                                  </p>

                                  <div className="flex justify-between items-center mt-2">
                                    <span
                                      className={`text-lg font-bold ${
                                        isDark
                                          ? "text-green-400"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {note.cost
                                        ? formatCurrency(Number(note.cost))
                                        : "No cost"}
                                    </span>

                                    <span className="text-xs text-gray-400 line-through">
                                      Est: ${note.estcost}
                                    </span>
                                  </div>

                                  <p className="text-xs text-gray-500 mt-2">
                                    {note.createdAt.split("T")[0]}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {i < sidebarThemes.length - 1 && (
                              <div className="border-b-2 border-primary/20 pt-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* =========================== */}
      {/* NEW RECHARTS: LineChart + RadialBarChart */}
      {/* md: side-by-side | below: stacked */}
      {/* =========================== */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* === LEFT: Monthly Spending Trend (LineChart) === */}
        <Card className="flex-1 border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden">
          <Card.Header className="flex flex-col gap-4 p-5">
            <h2 className="font-reddit-condensed text-lg font-extrabold text-default-900 tracking-tight">
              Monthly Spending Trend
            </h2>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: isDark ? "#9ca3af" : "#6b7280",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: isDark ? "#9ca3af" : "#6b7280",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "12px",
                      fontSize: "13px",
                    }}
                    formatter={(value: any) => [
                      `$${Number(value).toFixed(2)}`,
                      "Spent",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSpent)"
                  />
                  <ReferenceLine
                    y={trendAvg}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{
                      value: `Avg $${trendAvg.toFixed(0)}`,
                      position: "insideTopRight",
                      fill: "#f59e0b",
                      fontSize: 11,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Header>
        </Card>

        {/* === RIGHT: Savings Percentage (RadialBarChart) === */}
        <Card className="flex-1 border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden">
          <Card.Header className="flex flex-col items-center gap-4 p-5">
            <h2 className="font-reddit-condensed text-lg font-extrabold text-default-900 tracking-tight">
              Monthly Savings
            </h2>
            <div className="relative w-[240px] h-[260px] sm:w-[280px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="80%"
                  innerRadius="75%"
                  outerRadius="110%"
                  barSize={18}
                  startAngle={180}
                  endAngle={0}
                  data={[
                    {
                      name: "Savings",
                      value: Math.min(Math.abs(savingsPercent), 100),
                      fill: savingsPercent >= 0 ? "#10b981" : "#ef4444",
                    },
                  ]}
                >
                  <RadialBar
                    background={{ fill: isDark ? "#374151" : "#e5e7eb" }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span
                  className={`text-3xl sm:text-4xl font-extrabold ${
                    savingsPercent >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {savingsPercent >= 0 ? "+" : ""}
                  {savingsPercent}%
                </span>
                <span className="text-xs text-default-400 mt-1">
                  {savingsPercent >= 0 ? "saved" : "over"}
                </span>
              </div>
            </div>
          </Card.Header>
        </Card>
      </div>

      {/* =========================== */}
      {/* ORIGINAL CHART (Nivo Pie) */}
      {/* =========================== */}
      <div className="flex-1 min-w-0 overflow-visible">
        <AnalyticChart />
      </div>

      {/* =========================== */}
      {/* RECENT COMPLETED NOTES (Top 3) */}
      {/* =========================== */}
      {topNotes.length > 0 && (
        <div className="mt-8">
          <h3 className="font-reddit-condensed text-xl font-extrabold text-default-900 tracking-tight mb-4">
            Top Expenses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topNotes.map((note, idx) => {
              const themeColor =
                themes.find((t) => t.name === note.theme)?.color || "#9ca3af";
              return (
                <Card
                  key={note.id}
                  className="border-2 border-divider bg-content1/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Card.Header className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: themeColor }}
                        />
                        <span className="text-xs text-default-400 font-reddit-condensed tracking-wide uppercase">
                          {idx + 1}.{" "}
                          {note.theme === "No theme " ? "No theme" : note.theme}
                        </span>
                      </div>
                      <span className="text-xs text-default-400">
                        {note.createdAt.split("T")[0]}
                      </span>
                    </div>
                    <p className="font-semibold text-default-900 truncate">
                      {note.productTitle}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-emerald-600">
                        {formatCurrency(
                          Number(note.cost) || Number(note.estcost) || 0,
                        )}
                      </span>
                      {note.cost && note.estcost && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            Number(note.cost) <= Number(note.estcost)
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {Number(note.cost) <= Number(note.estcost)
                            ? "Under"
                            : "Over"}{" "}
                          budget
                        </span>
                      )}
                    </div>
                    {note.cost && note.estcost && (
                      <div className="w-full bg-default-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            Number(note.cost) <= Number(note.estcost)
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (Number(note.cost) / Number(note.estcost)) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </Card.Header>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
