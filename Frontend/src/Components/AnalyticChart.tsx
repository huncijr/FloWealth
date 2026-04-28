import { useMemo, useState } from "react";
import { useNotes } from "../Context/Notescontext";
import { useThemes } from "../Context/ThemeContext";
import { ResponsivePie } from "@nivo/pie";
import { Button, Dropdown, Label, type Selection } from "@heroui/react";
import { BadgeCheck, ChevronDown } from "lucide-react";
import useDarkMode from "./Mode";

interface ChartData {
  id: string;
  name: string;
  color: string;
  cost: number;
}

export const TimeRanges = {
  AllTime: "All time",
  ThisMonth: "This Month",
  Last7Days: "Last 7 days",
  Last24Hours: "Last 24 hours",
} as const;

export type TimeRange = (typeof TimeRanges)[keyof typeof TimeRanges];
interface ThemeCostChartProps {
  range: TimeRange;
}

const ThemeCostChart = ({ range }: ThemeCostChartProps) => {
  const { themes } = useThemes();
  const { notes } = useNotes();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filters notes based on the selected time range using millisecond comparisons
  const isInRange = (dateValue: string | Date) => {
    const now = new Date();
    const noteDate = new Date(dateValue);

    if (Number.isNaN(noteDate.getTime())) return false;

    if (range === "All time") return true;

    if (range === "Last 24 hours") {
      const diff = now.getTime() - noteDate.getTime();
      return diff <= 24 * 60 * 60 * 1000;
    }

    if (range === "Last 7 days") {
      const diff = now.getTime() - noteDate.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }

    // This Month
    return (
      noteDate.getFullYear() === now.getFullYear() &&
      noteDate.getMonth() === now.getMonth()
    );
  };

  const notesInRange = useMemo(() => {
    return notes.filter((n) => n.completed);
  }, [notes, range]);

  const hoveredNotes = useMemo(() => {
    if (!hoveredId) return [];
    if (hoveredId === "NO THEME ADDED") {
      return notesInRange.filter((n) => n.theme === "No theme ");
    }
    return notesInRange.filter((n) => n.theme === hoveredId);
  }, [hoveredId, notesInRange]);

  // Aggregates completed notes by theme to create pie chart data
  // Includes a special "No theme added" slice for unthemed notes
  const data = useMemo<ChartData[]>(() => {
    const completedNotes = notes.filter((note) => {
      if (!note.completed) return false;

      const dateField =
        (note as any).createdAt ??
        (note as any).date ??
        (note as any).updatedAt;
      if (!dateField) return range === "All time";
      return isInRange(dateField);
    });

    const themeCosts = themes.map((theme) => {
      const themeNotes = completedNotes.filter(
        (note) => note.theme === theme.name,
      );
      const totalCost = themeNotes.reduce(
        (sum, note) => sum + (Number(note.cost) || 0),
        0,
      );

      return {
        id: theme.name,
        name: theme.name,
        color: theme.color,
        cost: totalCost,
      };
    });

    const noThemeNotes = completedNotes.filter(
      (note) => note.theme === "No theme ",
    );
    const noThemeCost = noThemeNotes.reduce(
      (sum, note) => sum + (Number(note.cost) || 0),
      0,
    );

    if (noThemeCost > 0) {
      themeCosts.push({
        id: "NO THEME ADDED",
        name: "No theme added",
        color: "#b7b7b7",
        cost: noThemeCost,
      });
    }

    return themeCosts.filter((item) => item.cost > 0);
  }, [themes, notes, range]);

  const totalSpent = useMemo(
    () => data.reduce((sum, item) => sum + item.cost, 0),
    [data],
  );

  const centerText = hoveredId ? data.find((d) => d.id === hoveredId) : null;

  const isSm = typeof window !== "undefined" && window.innerWidth >= 640;

  const pieMargin = isSm
    ? { top: 50, right: 140, bottom: 30, left: 140 }
    : { top: 100, right: 70, bottom: 50, left: 70 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-3">
      <div className="lg:col-span-4 rounded-2xl   p-4 overflow-y-auto">
        <aside className="rounded-2xl  p-4 h-60 overflow-y-auto">
          <h3 className="font-semibold mb-3">
            {hoveredId ? `${hoveredId} notes` : "Hover a slice to see notes"}
          </h3>

          {hoveredId ? (
            hoveredNotes.length ? (
              <ul className="space-y-2">
                {hoveredNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-lg border dark:border-gray-600 p-2"
                  >
                    <div className="font-medium">{note.productTitle}</div>
                    <div className="text-xs opacity-70">
                      {new Date(note.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm">${Number(note.cost || 0)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-70">
                No notes in this category/time range.
              </p>
            )
          ) : (
            <p className="text-sm opacity-70">
              Move your mouse over a donut section.
            </p>
          )}
        </aside>
      </div>
      <div className="lg:col-span-8 rounded-2xl border dark:border-gray-700 p-4">
        <div className="relative h-[300px] sm:h-[40vw] w-full">
          <ResponsivePie
            data={data}
            innerRadius={0.8}
            value="cost"
            padAngle={2}
            cornerRadius={6}
            colors={{ datum: "data.color" }}
            onMouseEnter={(datum) => setHoveredId(datum.id as string)}
            onMouseLeave={() => setHoveredId(null)}
            tooltip={({ datum }) => (
              <div className="dark:bg-gray-900 dark:text-white bg-white text-black px-6 py-6 rounded-lg shadow-xl text-sm">
                <div className="text-sm font-bold mb-2">
                  ${Number(datum.value).toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">
                  {((Number(datum.value) / totalSpent) * 100).toFixed(1)}% from{" "}
                  {range}
                </div>
              </div>
            )}
            arcLabel={(d) =>
              `${totalSpent > 0 ? ((d.value / totalSpent) * 100).toFixed(0) : 0}%`
            }
            arcLabelsRadiusOffset={0.75}
            arcLabelsTextColor="white"
            arcLabelsSkipAngle={10}
            arcLinkLabel={(d) =>
              `${d.id}\n$${Number(d.value).toLocaleString()}`
            }
            arcLinkLabelsTextColor={{ from: "color" }}
            arcLinkLabelsSkipAngle={5}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            enableArcLabels
            activeOuterRadiusOffset={12}
            activeInnerRadiusOffset={2}
            margin={pieMargin}
            motionConfig="gentle"
            transitionMode="startAngle"
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center invisible sm:visible">
            {centerText ? (
              <>
                <div
                  className="text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold"
                  style={{ color: centerText.color }}
                >
                  {centerText.name}
                </div>
                <div className="text-sm md:text-lg">
                  ${centerText.cost.toLocaleString()}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl">${totalSpent.toLocaleString()}</div>
                <div>{range}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticChart = () => {
  const [selected, setSelected] = useState<Selection>(new Set(["All time"]));
  const { isDark } = useDarkMode();
  const options: TimeRange[] = [
    TimeRanges.AllTime,
    TimeRanges.ThisMonth,
    TimeRanges.Last7Days,
    TimeRanges.Last24Hours,
  ];

  const selectedLabel = useMemo<TimeRange>(() => {
    if (selected === "all") return TimeRanges.AllTime;
    const first = Array.from(selected as Set<React.Key>)[0];
    return (String(first) as TimeRange) ?? TimeRanges.AllTime;
  }, [selected]);
  return (
    <div className="p-8">
      <div className="dark:bg-gray-800 bg-white flex flex-col">
        <div className="relative items-center text-center mt-5">
          <h2
            className="Archivo-Black text-lg tracking-wilder sm:text-xl md:text-2xl lg:text-3xl tracking-wider
          "
          >
            Analytics
          </h2>

          <div className="absolute -bottom-8 right-3 sm:-bottom-2 sm:right-5">
            <Dropdown>
              <Button className="rounded-lg" variant="ghost">
                <ChevronDown /> {selectedLabel}
              </Button>

              <Dropdown.Popover className="min-w-[220px]">
                <Dropdown.Menu
                  selectedKeys={selected}
                  selectionMode="single"
                  disallowEmptySelection
                  onSelectionChange={setSelected}
                >
                  {options.map((option) => (
                    <Dropdown.Item key={option} id={option} textValue={option}>
                      <Dropdown.ItemIndicator>
                        {({ isSelected }) =>
                          isSelected ? <BadgeCheck size={16} /> : null
                        }
                      </Dropdown.ItemIndicator>
                      <Label>{option}</Label>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>

        <div
          className={`${
            isDark ? "-gray-800" : "bg-whitebg"
          }  rounded-2xl shadow-lg p-6`}
        >
          <ThemeCostChart range={selectedLabel} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticChart;
