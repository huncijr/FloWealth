import { useEffect, useMemo, useState } from "react";
import useDarkMode from "../Components/Mode";
import { useAuth } from "../Context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CheckCircleIcon,
  Menu,
  Palette,
  Plus,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { useNotes } from "../Context/Notescontext";
import { useThemes, type Theme } from "../Context/ThemeContext";
import AnalyticChart from "../Components/AnalyticChart";
import SkeletonLoading from "../Components/SkeletonLoading";
import { Button, Card } from "@heroui/react";
import { useNavigate } from "react-router-dom";

type ThemeWithVirtual = Theme & { isVirtual?: boolean };

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { isDark } = useDarkMode();
  const navigate = useNavigate();

  const [issidebaropen, setIsSidebarOpen] = useState(false);
  const [hasFetchedLocally, setHasFetchedLocally] = useState(false);

  const { themes, refreshThemes, isloading: themesLoading } = useThemes();
  const { notes, refreshNotes, isloading: notesLoading } = useNotes();

  // Fetch once on mount
  useEffect(() => {
    if (hasFetchedLocally) return;
    setHasFetchedLocally(true);
    refreshThemes();
    refreshNotes();
  }, [hasFetchedLocally, refreshThemes, refreshNotes]);

  const isloading = notesLoading || themesLoading;

  const completedNotes = useMemo(
    () => notes.filter((n) => n.completed),
    [notes],
  );

  const handleNavigateToExpenses = () => {
    navigate("/Expenses");
  };

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

  // AnalyticsPage.tsx - "Make an account" state
  if (!user) {
    return (
      <div className="relative flex items-center justify-center min-h-[60vh] p-8">
        {/* Card */}
        <Card className="relative z-10 max-w-md w-full bg-content1/80 backdrop-blur-sm border-1 border-divider shadow-xl">
          <Card.Header className="flex flex-col items-center gap-6 p-8">
            {/* Icon with Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <div className="relative p-6 bg-primary/10 rounded-full">
                <UserPlus className="w-16 h-16 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center">Make an Account</h2>

            {/* Description */}
            <p className="text-center text-default-500 max-w-sm">
              Sign up to track your expenses with AI-powered receipt scanning!
            </p>

            {/* Feature Chips */}
            <div className="badge-gold text-sm">
              <span className="badge-sheen" />
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Free</span>
              <span>·</span>
              <span>AI-powered</span>
              <span>·</span>
              <span>Easy</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button className="btn-gold" onClick={() => navigate("/Account")}>
                Create Account
              </Button>
              <Button
                className="btn-gold btn-gold-outline"
                onClick={() => navigate("/Home")}
              >
                Learn More
              </Button>
            </div>
          </Card.Header>
        </Card>
      </div>
    );
  }

  // ===========================
  // EMPTY STATES
  // ===========================
  if (completedNotes.length === 0) {
    // Themes exist, but no completed notes
    if (themes.length > 0) {
      return (
        <div className="relative flex items-center justify-center min-h-[60vh] p-8">
          <Card className="relative z-10 max-w-md w-full bg-content1/80 backdrop-blur-sm border-1 border-divider shadow-xl">
            <Card.Header className="flex flex-col items-center gap-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-success/30 rounded-full blur-xl" />
                <div className="relative p-6 bg-success/10 rounded-full">
                  <CheckCircleIcon className="w-16 h-16 text-success" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center">
                No completed notes!
              </h2>

              <p className="text-center text-default-500 max-w-sm">
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
        <Card className="relative z-10 max-w-lg w-full bg-content1/80 backdrop-blur-sm border-1 border-divider shadow-xl">
          <Card.Header className="flex flex-col items-center gap-6 p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <div className="relative p-6 bg-primary/10 rounded-full">
                <Palette className="w-16 h-16 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center">No themes yet!</h2>

            <p className="text-center text-default-500 max-w-sm">
              Start organizing your expenses by creating your first theme.
            </p>

            <div className="flex items-center gap-2 px-4 py-2 bg-content2 rounded-full text-sm">
              <BarChart3 className="w-4 h-4 text-default-400" />
              <span className="text-default-500">0 themes · 0 notes</span>
            </div>

            <div className="w-full p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-default-500 text-center">
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
  // MAIN ANALYTICS VIEW
  // ===========================
  return (
    <div className="flex py-10 sm:py-20 px-4 sm:px-5 w-full">
      <div className="flex flex-col w-full min-w-0">
        <h1
          className="Abril-Fatface text-3xl sm:text-4xl md:text-5xl text-primary 
          w-fit mx-auto sm:mx-0 transition-all duration-300 ease-in-out"
        >
          Welcome, {user.name} !
        </h1>

        <div className="flex mt-3 items-center gap-4">
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {!issidebaropen ? (
                <motion.button
                  key="menu"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-primary/20 rounded-full transition-colors"
                >
                  <Menu size={28} className="text-primary cursor-pointer" />
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
                        ? "bg-gray-600 border-gray-900"
                        : "bg-white border-gray-200"
                    } border-r-4 border-b-4 rounded-br-lg rounded-tr-lg
                      min-h-screen max-h-screen flex flex-col`}
                    style={{
                      width: "clamp(280px,85vw,350px)",
                      position: "fixed",
                      left: 0,
                      top: 0,
                      zIndex: 50,
                    }}
                  >
                    <div
                      className={`flex items-center justify-between p-6 border-b ${
                        isDark
                          ? "bg-gray-600 border-b-gray-500"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h2
                        className="font-[Abril_Fatface] text-xl text-gray-900"
                        style={{
                          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        Statistics
                      </h2>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X size={24} className="text-gray-700" />
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
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: theme.color }}
                                />
                                <h3
                                  className={`font-[Abril_Fatface] text-xl ${
                                    theme.isVirtual
                                      ? "text-gray-500"
                                      : "text-primary"
                                  }`}
                                >
                                  {theme.name}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  ({themeNotes.length} notes)
                                </span>
                              </div>

                              <div className="space-y-2">
                                {mostlycosted.map((note) => (
                                  <div
                                    key={note.id}
                                    className={`p-4 rounded-lg border-l-4 ${
                                      isDark ? "bg-gray-700" : "bg-gray-200"
                                    } ${theme.isVirtual ? "opacity-90" : ""}`}
                                    style={{
                                      borderLeftColor: theme.color,
                                    }}
                                  >
                                    <p className="font-medium text-base">
                                      {note.productTitle}
                                    </p>

                                    <div className="flex justify-between items-center mt-2">
                                      <span
                                        className={`text-xl font-bold ${
                                          isDark
                                            ? "text-green-400"
                                            : "text-green-600"
                                        }`}
                                      >
                                        {note.cost
                                          ? new Intl.NumberFormat("en-US", {
                                              style: "currency",
                                              currency: "USD",
                                            }).format(Number(note.cost))
                                          : "No cost"}
                                      </span>

                                      <span className="text-sm text-gray-400 line-through">
                                        Est: ${note.estcost}
                                      </span>
                                    </div>

                                    <p className="text-sm text-gray-500 mt-2">
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

        <div className="flex-1 min-w-0 overflow-y-auto">
          <AnalyticChart />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
