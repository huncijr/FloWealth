import { useMemo, useState } from "react";
import { useNotes } from "../Context/Notescontext";
import { useThemes } from "../Context/ThemeContext";
import { ResponsivePie } from "@nivo/pie";

interface ChartData {
  id: string;
  name: string;
  color: string;
  cost: number;
}

const ThemeCostChart = () => {
  const { themes } = useThemes();
  const { notes } = useNotes();
  const [hoveredid, setHoveredId] = useState<string | null>(null);

  const data = useMemo<ChartData[]>(() => {
    const completednotes = notes.filter((note) => note.completed);

    const themeCosts = themes.map((theme) => {
      const themeNotes = completednotes.filter(
        (note) => note.theme === theme.name,
      );
      const totalcost = themeNotes.reduce((sum, note) => {
        return sum + (Number(note.cost) || 0);
      }, 0);

      return {
        id: theme.name,
        name: theme.name,
        color: theme.color,
        cost: totalcost,
      };
    });

    const noThemeNotes = completednotes.filter(
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
  }, [themes, notes]);

  const totalSpent = useMemo(() => {
    return data.reduce((sum, item) => sum + item.cost, 0);
  }, [data]);

  const centerText = hoveredid ? data.find((d) => d.id === hoveredid) : null;
  return (
    <div className="relative w-full h-96">
      <ResponsivePie
        data={data}
        innerRadius={0.6}
        value="cost"
        padAngle={2}
        cornerRadius={6}
        colors={{ datum: "data.color" }}
        onMouseEnter={(datum) => setHoveredId(datum.id as string)}
        onMouseLeave={() => setHoveredId(null)}
        tooltip={({ datum }) => (
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm">
            <div className="font-semibold">{datum.id}</div>
            <div className="text-lg font-bold">
              ${Number(datum.value).toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs">
              {((Number(datum.value) / totalSpent) * 100).toFixed(1)}% az
              összesből
            </div>
          </div>
        )}
        arcLabel={(d) => `${((d.value / totalSpent) * 100).toFixed(0)}%`}
        arcLabelsRadiusOffset={0.75}
        arcLabelsTextColor="white"
        arcLabelsSkipAngle={10}
        arcLinkLabel={(d) => `${d.id}\n$${Number(d.value).toLocaleString()}`}
        arcLinkLabelsTextColor={{ from: "color" }}
        arcLinkLabelsSkipAngle={5}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        enableArcLabels={true}
        margin={{ top: 50, right: 140, bottom: 30, left: 140 }}
        motionConfig="gentle"
        transitionMode="startAngle"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center ">
        {centerText ? (
          <>
            <div className="text-2xl font-bold ">
              ${centerText.cost.toLocaleString()}
            </div>
            <div className="text-sm">{centerText.name}</div>
          </>
        ) : (
          <>
            <div className="text-3xl">${totalSpent.toLocaleString()}</div>
            <div>All</div>
          </>
        )}
      </div>
    </div>
  );
};

const AnalyticChart = () => {
  return (
    <div className="p-8">
      <h2>Analytics</h2>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
        <ThemeCostChart />
      </div>
    </div>
  );
};

export default AnalyticChart;
