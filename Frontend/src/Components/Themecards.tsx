import { Spinner } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/axiosInstance";

interface DailyStat {
  count: number;
  notes: string[];
}
interface ThemeStat {
  name: string;
  color: string;
  dailyStats: Record<string, DailyStat>;
}
const ThemeWaveChart = ({
  dailyStats,
}: {
  dailyStats: Record<string, DailyStat>;
}) => {
  const [hoveredday, setHoveredDay] = useState<string | null>();
  //Last 30day
  const dates = Object.keys(dailyStats).sort();
  const maxCount = Math.max(...dates.map((d) => dailyStats[d].count), 1);

  return (
    <div className="relative w-full h-32 flex items-end justify-between gap-1 px-4">
      {dates.map((date, index) => {
        const stat = dailyStats[date];
        const heightPercent = (stat.count / maxCount) * 100;
        const isHovered = hoveredday === date;
        return (
          <div
            key={date}
            className="relative flex-1 flex flex-col items-center group cursor-pointer"
            onMouseEnter={() => setHoveredDay(date)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {" "}
            {/* Tooltip */}
            {isHovered && stat.count > 0 && (
              <div className="absolute bottom-full mb-2 bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                <div className="font-bold">{date}</div>
                <div>{stat.count} note</div>
                {stat.notes.slice(0, 3).map((note, i) => (
                  <div key={i}>{note}</div>
                ))}
                {stat.notes.length > 3 && (
                  <div className="text-gray-400">
                    {stat.notes.length - 3} more
                  </div>
                )}
              </div>
            )}
            {/* Bar/Wave */}
            <div
              className="w-full bg-white/30 rounded-t-sm transition-all duration-300 hover:bg-white/60"
              style={{
                height: `${Math.max(heightPercent, 5)}%`,
                opacity: stat.count > 0 ? 0.8 : 0.2,
              }}
            ></div>
          </div>
        );
        {
          index % 3 === 0 && (
            <div className="absolute -bottom-4 text-xl text-white/60">
              {date.slice(5)}
            </div>
          );
        }
      })}
    </div>
  );
};

const ThemeCard = ({ theme }: { theme: ThemeStat }) => {
  const totalnotes = Object.values(theme.dailyStats).reduce(
    (sum, day) => sum + day.count,
    0,
  );

  return (
    <div
      className="w-[80%] mx-5 rounded-2xl  overflow-hidden shadow-lg"
      style={{ backgroundColor: theme.color }}
    >
      <div className="p-6 pb-2">
        <h3 className="text-2xl font-bold">{theme.name}</h3>
        <p className="">{totalnotes} in last 30 days</p>
      </div>
      <div className="relative mt-4 ">
        <ThemeWaveChart dailyStats={theme.dailyStats} />
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
const ThemeList = ({ themes }: { themes: any[] }) => {
  const [themestats, setThemeStats] = useState<ThemeStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/themestats");
      if (response.data.success) {
        setThemeStats(response.data.stats);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchStats();
  }, [themes, fetchStats]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {themestats.map((theme, i) => (
        <ThemeCard key={i} theme={theme} />
      ))}
    </div>
  );
};

export default ThemeList;
