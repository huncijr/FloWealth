import { Chip, Spinner, Tooltip } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { Check, ShieldAlert, Trash2 } from "lucide-react";
import useDarkMode from "./Mode";
import { useThemes } from "../Context/ThemeContext";

interface DailyStat {
  count: number;
  notes: Array<{ title: string; completed: boolean | null }>;
  color: string;
}
interface ThemeStat {
  name: string;
  id: number;
  color: string;
  dailyStats: Record<string, DailyStat>;
}

interface ThemeWaveChartProps {
  dailyStats: Record<string, DailyStat>;
  color: string;
}

interface ThemeListProps {
  onThemeDeleted?: () => void;
}

interface ThemeCardProps {
  theme: ThemeStat;
  onDelete: (id: number) => void;
}

// Renders a bar chart visualization of daily note activity for a theme
// Uses square root scaling to better visualize smaller counts when max is large
const ThemeWaveChart = ({ dailyStats, color }: ThemeWaveChartProps) => {
  const [hoveredday, setHoveredDay] = useState<string | null>();
  const dates = Object.keys(dailyStats).sort();
  // Calculate maximum count for scaling bars (min 1 to prevent division by zero)
  const maxCount = Math.max(...dates.map((d) => dailyStats[d].count), 1);

  return (
    <div className="relative w-full h-40">
      <div className="px-4 absolute inset-0 flex items-end justify-between gap-[2px] sm:gap-1 md:gap-2 pb-6">
        {dates.map((date, index) => {
          const count = dailyStats[date].count;
          const height = Math.sqrt(count / maxCount) * 100;
          const isHovered = hoveredday === date;

          const isLast = index === dates.length - 1;

          return (
            <div
              key={date}
              className="flex-1 h-full relative cursor-pointer group"
              onMouseEnter={() => setHoveredDay(date)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {isHovered && count > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50">
                  <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap min-w-[120px]">
                    <div className="font-bold border-b border-white/20 pb-1 mb-1">
                      {date}
                    </div>
                    <div className="text-white/80">
                      {count} note{count > 1 ? "s" : ""}
                    </div>
                    <div className="mt-1 space-y-0.5 max-h-20 overflow-y-auto">
                      {dailyStats[date].notes.slice(0, 3).map((note, i) => (
                        <div
                          key={i}
                          className="flex justify-start items-center"
                        >
                          <div
                            className="text-lg text-gray-300 truncate mx-2"
                            style={{ color: color }}
                          >
                            •
                          </div>
                          {note.title}
                          <div className="px-2">
                            {note.completed && (
                              <div className="flex items-center justify-center">
                                <Chip color="success" className="h-5 w-5 p-1">
                                  <Check />
                                </Chip>
                              </div>
                            )}{" "}
                          </div>
                        </div>
                      ))}
                      {dailyStats[date].notes.length > 3 && (
                        <div className="text-[10px] text-gray-400">
                          +{dailyStats[date].notes.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              )}

              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full bg-white/30 group-hover:bg-white/50 transition-all rounded-t-sm"
                style={{ height: `${Math.max(height, 5)}%` }}
              />

              <div
                className={`
                absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] text-white/60 whitespace-nowrap
                ${index % 5 === 0 || isLast ? "block" : "hidden"}
                
              `}
              >
                {date.slice(5)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ThemeCard = ({ theme, onDelete }: ThemeCardProps) => {
  const { isDark } = useDarkMode();

  const totalnotes = Object.values(theme.dailyStats).reduce(
    (sum, day) => sum + day.count,
    0,
  );
  const handleDeleteThemes = async (e: React.FormEvent, themeid: number) => {
    e.preventDefault();
    try {
      const response = await api.delete(`/deletetheme/${themeid}`);
      if (response.data.success) {
        onDelete(theme.id);
      }
    } catch (error) {}
  };
  return (
    <div
      className="w-[95] mx-5 rounded-2xl relative shadow-lg theme-list-animate "
      style={{ backgroundColor: theme.color }}
    >
      <div className="p-6 pb-2">
        <div className="flex justify-between">
          <h3 className="text-2xl font-bold">{theme.name}</h3>
          <div className="flex items-center gap-4 bg-red-800 rounded-2xl   ">
            <button
              className="p-1"
              onClick={(e) => handleDeleteThemes(e, theme.id)}
            >
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Trash2 className="cursor-pointer " />
                </Tooltip.Trigger>
                <Tooltip.Content className="bg-red-600">
                  <div className="flex  items-center justify-center">
                    <p className="font-bold  ">
                      THIS WILL DELETE THE THEME AND ALL THE NOTES WITH IT!
                    </p>
                    <ShieldAlert
                      className={`${isDark ? "text-white" : "text-black"}`}
                    />
                  </div>
                </Tooltip.Content>
              </Tooltip>
            </button>
          </div>
        </div>
        <p className="">{totalnotes} in last 30 days</p>
      </div>
      <div className="relative mt-4 ">
        <ThemeWaveChart dailyStats={theme.dailyStats} color={theme.color} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
      <div className="relative h-8 bg-white/10">
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255,255,255,0.2)"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
};

// MAIN COMPONENT
// Main component that fetches theme statistics and renders theme cards
// Falls back to empty stats if backend returns no data
const ThemeList = ({ onThemeDeleted }: ThemeListProps) => {
  const { themes, refreshThemes, themeStats, refreshThemeStats } = useThemes();
  const [themestats, setThemeStats] = useState<ThemeStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (themes.length > 0) {
      setLoading(false);
    } else if (themes.length > 0) {
      setLoading(false);
    }
  }, [themes, themeStats]);
  useEffect(() => {
    if (themestats.length > 0 || themes.length > 0) {
      refreshThemeStats();
      setLoading(false);
    }
  }, [themes]);
  // Refreshes theme list and removes deleted theme from local state
  const handleThemeDeleted = async (deletedId: number) => {
    await refreshThemes();
    await refreshThemeStats();
    setThemeStats((prev) => prev.filter((theme) => theme.id !== deletedId));
    if (onThemeDeleted) {
      onThemeDeleted();
    }
  };

  if (loading) return <Spinner />;

  // Fallback: if no stats available but themes exist, create empty stats structure
  // This ensures themes always display even without historical data
  const displayStats =
    themeStats.length > 0
      ? themeStats
      : themes.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          dailyStats: {},
        }));

  return (
    <div className="space-y-4">
      {displayStats.map((theme, i) => (
        <ThemeCard key={i} theme={theme} onDelete={handleThemeDeleted} />
      ))}
    </div>
  );
};

export default ThemeList;
