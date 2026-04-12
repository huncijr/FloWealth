import { type Note, useNotes } from "../Context/Notescontext";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  Label,
  ListBox,
  ScrollShadow,
  Select,
} from "@heroui/react";
import { useState } from "react";
import { useThemes } from "../Context/ThemeContext";
import {
  AlertCircle,
  ArrowRightLeft,
  Check,
  NotebookPen,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import useDarkMode from "./Mode";
import { api } from "../api/axiosInstance";

export const NoteComparison = () => {
  const { notes } = useNotes();
  const { themes } = useThemes();
  const { isDark } = useDarkMode();

  const [selectedtheme, setSelectedTheme] = useState<string>("all");
  const [comparisonresult, setComparisonResult] =
    useState<ParsedComparison | null>(null);

  const completedNotes = notes.filter((note) => note.completed);
  const filteredNotes =
    selectedtheme === "all"
      ? completedNotes
      : completedNotes.filter((note) => note.theme === selectedtheme);

  const [noteA, setNoteA] = useState<Note | null>(null);
  const [noteB, setNoteB] = useState<Note | null>(null);
  const [iscomparing, setIsComparing] = useState<boolean>(false);
  const [quotaexceeded, setQuotaExceeded] = useState<boolean>(false);
  const [lastcomparedNotes, setLastComparedNotes] = useState<{
    noteA: Note | null;
    noteB: Note | null;
  } | null>(null);

  const handleCompare = async () => {
    if (!noteA || !noteB) return;
    if (
      lastcomparedNotes?.noteA?.id === noteA.id &&
      lastcomparedNotes?.noteB?.id === noteB.id
    ) {
      return;
    }
    setIsComparing(true);
    try {
      const response = await api.post(
        "/compare-notes",
        {
          noteIdA: noteA.id,
          noteIdB: noteB.id,
          noteA: {
            productTitle: noteA.productTitle,
            estcost: noteA.estcost,
            cost: noteA.cost,
            products: noteA.products,
            picture: noteA.picture,
          },
          noteB: {
            productTitle: noteB.productTitle,
            estcost: noteB.estcost,
            cost: noteB.cost,
            products: noteB.products,
            picture: noteB.picture,
          },
        },
        { timeout: 30000 },
      );
      if (response.data.success) {
        setLastComparedNotes({ noteA, noteB });
        const parsed = parseAIResponse(response.data.result);
        setComparisonResult(parsed);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        setQuotaExceeded(true);
        return;
      }
    } finally {
      setIsComparing(false);
    }
  };

  type ParsedComparison = {
    table: { headers: string[]; rows: string[][] } | null;
    insights: { title: string; bullets: string[] }[];
    winner: { name: string; reasons: string[] } | null;
    tips: string[];
  };

  const DEFAULT_TABLE = {
    headers: ["category", "note_a", "note_b"],
    rows: [
      ["estimated_cost", "N/A", "N/A"],
      ["actual_cost", "N/A", "N/A"],
      ["price_diff", "N/A", "N/A"],
      ["item_count", "N/A", "N/A"],
    ],
  };

  const DEFAULT_WINNER = { name: "Tie", reasons: ["N/A", "N/A"] };

  const cleanLine = (s: string) => s.replace(/\r/g, "").trim();

  const isTableLine = (line: string) => /^\|.*\|$/.test(line);

  const parseMarkdownRow = (line: string) =>
    line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

  const isSeparatorRow = (cells: string[]) =>
    cells.length >= 3 && cells.every((c) => /^-+$/.test(c) || c === "---");

  const sectionHeader = (name: string) =>
    new RegExp(`^\\*\\*${name}\\*\\*$`, "i");

  const keyInsightsHeader = sectionHeader("Key Insights");
  const winnerHeader = sectionHeader("Winner");
  const finalRecHeader = sectionHeader("Final Recommendation");

  const insightBulletRegex = /^(?:-\s+)\*\*(.+?)\*\*:\s*(.+)$/; // - **Title**: value
  const bulletValueRegex = /^(?:-\s+|\d+[.)]\s+)(.+)$/; // - x | 1. x | 2) x

  const winnerLineRegex = /^(?:-\s+)winner:\s*(Note A|Note B|Tie)\s*$/i;
  const winnerReasonRegex = /^(?:-\s+)reason:\s*(.+)$/i;

  const parseAIResponse = (response: string): ParsedComparison => {
    const result: ParsedComparison = {
      table: null,
      insights: [],
      winner: null,
      tips: [],
    };

    const lines = response.split("\n").map(cleanLine);

    // ----------------------------
    // 1) TABLE
    // ----------------------------
    const tableLines: string[] = [];
    for (const line of lines) {
      if (isTableLine(line)) tableLines.push(line);
    }

    if (tableLines.length >= 2) {
      const rows = tableLines.map(parseMarkdownRow).filter((r) => r.length > 0);
      const headers = rows[0] ?? [];
      const maybeSep = rows[1] ?? [];
      const dataRows = isSeparatorRow(maybeSep) ? rows.slice(2) : rows.slice(1);

      if (headers.length === 3 && dataRows.length > 0) {
        result.table = { headers, rows: dataRows };
      }
    }

    // normalize/fallback table -> exactly required rows
    if (!result.table) {
      result.table = DEFAULT_TABLE;
    } else {
      const map = new Map<string, string[]>();
      for (const r of result.table.rows) {
        const [cat, a, b] = r;
        if (cat) map.set(cat, [cat, a ?? "N/A", b ?? "N/A"]);
      }
      result.table = {
        headers: ["category", "note_a", "note_b"],
        rows: [
          map.get("estimated_cost") ?? ["estimated_cost", "N/A", "N/A"],
          map.get("actual_cost") ?? ["actual_cost", "N/A", "N/A"],
          map.get("price_diff") ?? ["price_diff", "N/A", "N/A"],
          map.get("item_count") ?? ["item_count", "N/A", "N/A"],
        ],
      };
    }

    // ----------------------------
    // 2) SECTIONS: Key Insights -> Winner -> Final Recommendation
    // ----------------------------
    let currentSection: "insights" | "winner" | "tips" | "" = "";

    const parsedInsights: { title: string; bullets: string[] }[] = [];
    const parsedTips: string[] = [];
    let parsedWinner: { name: string; reasons: string[] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // section switches
      if (keyInsightsHeader.test(line)) {
        currentSection = "insights";
        continue;
      }

      if (winnerHeader.test(line)) {
        currentSection = "winner";

        // parse Winner block immediately (so it is "külön", fixen felismerve)
        const w = { ...DEFAULT_WINNER };
        let reasonIdx = 0;

        let j = i + 1;
        while (j < lines.length && lines[j].startsWith("-")) {
          const wl = lines[j];

          const wm = wl.match(winnerLineRegex);
          if (wm) {
            const v = wm[1].toLowerCase();
            w.name =
              v === "note a" ? "Note A" : v === "note b" ? "Note B" : "Tie";
            j++;
            continue;
          }

          const rm = wl.match(winnerReasonRegex);
          if (rm) {
            if (reasonIdx < 2) {
              const txt = rm[1].trim();
              w.reasons[reasonIdx] = txt.length ? txt : "N/A";
              reasonIdx++;
            }
            j++;
            continue;
          }

          j++;
        }

        parsedWinner = w;
        i = j - 1; // skip consumed bullet lines
        continue;
      }

      if (finalRecHeader.test(line)) {
        currentSection = "tips";
        continue;
      }

      // content parsing
      if (currentSection === "insights") {
        const m = line.match(insightBulletRegex);
        if (m) {
          const title = (m[1] || "N/A").trim() || "N/A";
          const value = (m[2] || "N/A").trim() || "N/A";
          parsedInsights.push({ title, bullets: [`${title}:${value}`] });
        }
        continue;
      }

      if (currentSection === "tips") {
        const m = line.match(bulletValueRegex);
        if (m) {
          parsedTips.push((m[1] || "N/A").trim() || "N/A");
        }
        continue;
      }
    }

    // ----------------------------
    // 3) FORCE CONSISTENCY
    // ----------------------------

    // exactly 3 insights
    result.insights = parsedInsights.slice(0, 3);
    while (result.insights.length < 3) {
      result.insights.push({ title: "N/A", bullets: ["N/A:N/A"] });
    }

    // winner always present
    result.winner = parsedWinner ?? DEFAULT_WINNER;

    // exactly 3 tips
    result.tips = parsedTips.slice(0, 3);
    while (result.tips.length < 3) {
      result.tips.push("N/A");
    }

    return result;
  };

  const hasSelectedSameNotes =
    lastcomparedNotes?.noteA?.id === noteA?.id &&
    lastcomparedNotes?.noteB?.id === noteB?.id;

  return (
    <div className="mt-10">
      <div className="flex p-6 flex-col items-start py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-8"
        >
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight">
              <span className="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Compare Notes
              </span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-primary/70" />
            <p className="text-lg font-bold tracking-wide">
              Overview your spendings!
            </p>
            <div className="h-px w-16 bg-linear-to-l from-transparent to-secondary/70" />
          </div>{" "}
        </motion.div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <motion.div
            className="h-[520px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full relative overflow-hidden border-0 shadow-2xl ">
              <div
                className={`absolute inset-0 transition-colors duration-300 ${
                  isDark
                    ? "bg-linear-to-br from-gray-900 via-slate-900 to-gray-950"
                    : "bg-linear-to-br from-gray-400 via-slate-400 to-gray-500"
                }`}
              />
              <div
                className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl ${
                  isDark ? "bg-primary/20" : "bg-primary/10"
                }`}
              />
              <div
                className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                  isDark ? "bg-secondary/20" : "bg-secondary/10"
                }`}
              />
              <div
                className={`absolute inset-0 rounded-xl ring-1 ring-inset ${
                  isDark ? "ring-white/10" : "ring-gray-200/50"
                }`}
              />
              <div
                className={`absolute top-0 left-4 right-4 h-0.5 bg-linear-to-r from-transparent to-transparent ${
                  isDark ? "via-primary/50" : "via-primary/30"
                }`}
              />
              {isDark && (
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,...')] pointer-events-none" />
              )}

              <div className="relative z-10 flex-none flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-black flex items-center">
                  <span className="text-xl font-bold ml-2">A</span>
                </div>
              </div>
              <div className="relative z-10 flex-none px-4 pb-4">
                <Select
                  className="mb-4"
                  onChange={(key) => setSelectedTheme(key as string)}
                >
                  <div className="flex flex-col gap-1.5 mb-2">
                    <Label
                      className="text-xs font-semibold text-gray-900 dark:text-gray-400 uppercase tracking-wider 
                  flex items-center gap-2"
                    >
                      <div className="w-1 h-3 bg-linear-to-b from-primary to-secondary rounded-full" />
                      Filter by Theme
                    </Label>
                  </div>

                  <Select.Trigger
                    className="w-full bg-white/5 border border-white/10 
                hover:border-white/20 text-white rounded-xl h-11 px-4 
                transition-all duration-200 backdrop-blur-sm
                data-[open=true]:border-primary/50 data-[open=true]:bg-white/10"
                  >
                    <Select.Value className="text-sm" />
                    <Select.Indicator className="text-gray-400" />
                  </Select.Trigger>

                  <Select.Popover
                    className="bg-gray-900/95 backdrop-blur-xl border border-white/10 
                rounded-xl shadow-2xl shadow-black/50 mt-1 overflow-hidden"
                  >
                    <ListBox className="max-h-60 overflow-auto p-1">
                      <ListBox.Item
                        id="all"
                        textValue="All Themes"
                        className="px-3 py-2.5 rounded-lg cursor-pointer outline-none
                    hover:bg-white/10 focus:bg-white/10 text-gray-300
                    data-[selected=true]:bg-primary/20 data-[selected=true]:text-white
                    transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-gray-400 to-gray-500" />
                          <span className="text-sm font-medium">
                            All Themes
                          </span>
                        </div>
                      </ListBox.Item>

                      {themes.map((theme) => (
                        <ListBox.Item
                          key={theme.name}
                          id={theme.name}
                          textValue={theme.name}
                          className="px-3 py-2.5 rounded-lg cursor-pointer outline-none
                    hover:bg-white/10 focus:bg-white/10 text-gray-300
                    data-[selected=true]:bg-primary/20 data-[selected=true]:text-white
                    transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: theme.color }}
                            />
                            <span className="text-sm font-medium">
                              {theme.name}
                            </span>
                          </div>
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
              <ScrollShadow hideScrollBar className="h-[320px] space-y-3 p-1">
                {filteredNotes
                  .filter((note) => !noteB || note.id !== noteB?.id)
                  .map((note) => (
                    <motion.button
                      key={note.id}
                      onClick={() => {
                        if (noteA?.id === note.id) {
                          setNoteA(null);
                        } else {
                          setNoteA(note);
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative w-full text-left p-6 rounded-xl border-2 transition-all  ${
                        noteA?.id === note.id
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                          : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5
                    to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl
                    "
                      />
                      <div className="right-2 top-2 absolute">
                        <NotebookPen />
                      </div>
                      <div className="relative flex gap-3">
                        {note.picture && (
                          <img
                            src={note.picture}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {note.productTitle}
                          </h3>
                          <div className="flex gap-4 items-center">
                            <p className="font-bold Ubuntu">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(Number(note.cost || 0))}
                            </p>
                            <p className="text-xs italic  mt-1">
                              {note.products.length} items
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
              </ScrollShadow>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-[500px] flex flex-col justify-center items-center gap-6"
          >
            <div className="text-center">
              <p className="text-xl font-bold">Select two notes to compare!</p>
            </div>
            <div className="w-full space-y-4">
              {noteA && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {noteA.productTitle}
                      </p>
                      <p className="text-primary text-xs">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(noteA.cost || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <ArrowRightLeft className="w-8 h-8 " />
              </div>
              {noteB && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary font-bold">B</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {noteB.productTitle}
                      </p>
                      <p className="text-secondary text-xs">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(noteB.cost || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              size="lg"
              variant="tertiary"
              onClick={handleCompare}
              isDisabled={
                !noteA || !noteB || iscomparing || hasSelectedSameNotes
              }
              className="w-full max-w-xs relative overflow-hidden group 
    bg-linear-to-r from-primary via-secondary to-primary 
    bg-[length:200%_100%] hover:bg-[position:100%_0] 
    transition-all duration-500 
    shadow-lg hover:shadow-primary/50 hover:shadow-2xl
    border-0 hover:scale-105  hover:shadow-[0_0_50px_rgba(255, 127, 0),0.6)]
"
            >
              {iscomparing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <div className="flex">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Compare With FloWealth AI
                </div>
              )}
            </Button>
          </motion.div>
          <motion.div
            className="h-[520px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl h-full">
              <div
                className={`absolute inset-0 transition-colors duration-300 ${
                  isDark
                    ? "bg-linear-to-br from-gray-900 via-slate-900 to-gray-950"
                    : "bg-linear-to-br from-gray-400 via-slate-400 to-gray-500"
                }`}
              />
              <div
                className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl ${
                  isDark ? "bg-primary/20" : "bg-primary/10"
                }`}
              />
              <div
                className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                  isDark ? "bg-secondary/20" : "bg-secondary/10"
                }`}
              />
              <div
                className={`absolute inset-0 rounded-xl ring-1 ring-inset ${
                  isDark ? "ring-white/10" : "ring-gray-200/50"
                }`}
              />
              <div
                className={`absolute top-0 left-4 right-4 h-0.5 bg-linear-to-r from-transparent to-transparent ${
                  isDark ? "via-primary/50" : "via-primary/30"
                }`}
              />
              {isDark && (
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,...')] pointer-events-none" />
              )}

              <div className="relative z-10 flex-none flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-black flex items-center">
                  <span className="text-xl font-bold ml-2">B</span>
                </div>
              </div>
              <div className="relative z-10 flex-none px-4 pb-4">
                <Select
                  className="mb-4"
                  onChange={(key) => setSelectedTheme(key as string)}
                >
                  <div className="flex flex-col gap-1.5 mb-2">
                    <Label
                      className="text-xs font-semibold text-gray-900 dark:text-gray-400  uppercase tracking-wider 
      flex items-center gap-2"
                    >
                      <div className="w-1 h-3 bg-linear-to-b from-primary to-secondary rounded-full" />
                      Filter by Theme
                    </Label>
                  </div>

                  <Select.Trigger
                    className="w-full bg-white/5 border border-white/10 
    hover:border-white/20 text-white rounded-xl h-11 px-4 
    transition-all duration-200 backdrop-blur-sm
    data-[open=true]:border-primary/50 data-[open=true]:bg-white/10"
                  >
                    <Select.Value className="text-sm" />
                    <Select.Indicator className="text-gray-400" />
                  </Select.Trigger>

                  <Select.Popover
                    className="bg-gray-900/95 backdrop-blur-xl border border-white/10 
    rounded-xl shadow-2xl shadow-black/50 mt-1 overflow-hidden"
                  >
                    <ListBox className="max-h-60 overflow-auto p-1">
                      <ListBox.Item
                        id="all"
                        textValue="All Themes"
                        className="px-3 py-2.5 rounded-lg cursor-pointer outline-none
          hover:bg-white/10 focus:bg-white/10 text-gray-300
          data-[selected=true]:bg-primary/20 data-[selected=true]:text-white
          transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-gray-400 to-gray-500" />
                          <span className="text-sm font-medium">
                            All Themes
                          </span>
                        </div>
                      </ListBox.Item>

                      {themes.map((theme) => (
                        <ListBox.Item
                          key={theme.name}
                          id={theme.name}
                          textValue={theme.name}
                          className="px-3 py-2.5 rounded-lg cursor-pointer outline-none
            hover:bg-white/10 focus:bg-white/10 text-gray-300
            data-[selected=true]:bg-primary/20 data-[selected=true]:text-white
            transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: theme.color }}
                            />
                            <span className="text-sm font-medium">
                              {theme.name}
                            </span>
                          </div>
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
              <ScrollShadow hideScrollBar className="h-[320px] space-y-3 p-1">
                {filteredNotes
                  .filter((note) => !noteA || note.id !== noteA?.id)
                  .map((note) => (
                    <motion.button
                      key={note.id}
                      onClick={() => {
                        if (noteB?.id === note.id) {
                          setNoteB(null);
                        } else {
                          setNoteB(note);
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative w-full text-left p-6 rounded-xl border-2 transition-all  ${
                        noteB?.id === note.id
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                          : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5
                    to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl
                    "
                      />
                      <div className="right-2 top-2 absolute">
                        <NotebookPen />
                      </div>
                      <div className="relative flex gap-3">
                        {note.picture && (
                          <img
                            src={note.picture}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {note.productTitle}
                          </h3>
                          <div className="flex gap-4 items-center">
                            <p className="font-bold Ubuntu">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(Number(note.cost || 0))}
                            </p>
                            <p className="text-xs italic  mt-1">
                              {note.products.length} items
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
              </ScrollShadow>
            </Card>
          </motion.div>
        </div>
      </div>
      <div className="flex  w-full flex-col items-center text-center justify-center">
        <div className="w-full px-15">
          {comparisonresult && (
            <Card className="mt-6 w-full relative overflow-hidden border-0 shadow-2xl">
              <div
                className={`absolute inset-0 transition-colors duration-300 ${
                  isDark
                    ? "bg-linear-to-br from-gray-900 via-slate-900 to-gray-950"
                    : "bg-linear-to-br from-gray-400 via-slate-400 to-gray-500"
                }`}
              />
              <div
                className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl ${
                  isDark ? "bg-primary/20" : "bg-primary/10"
                }`}
              />
              <div
                className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                  isDark ? "bg-secondary/20" : "bg-secondary/10"
                }`}
              />

              {/* Ring */}
              <div
                className={`absolute inset-0 rounded-xl ring-1 ring-inset ${
                  isDark ? "ring-white/10" : "ring-gray-200/50"
                }`}
              />

              {/* Top line accent */}
              <div
                className={`absolute top-0 left-4 right-4 h-0.5 bg-linear-to-r from-transparent to-transparent ${
                  isDark ? "via-primary/50" : "via-primary/30"
                }`}
              />
              <div className="relative z-10 p-6">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                  <Sparkles className="w-5 h-5 text-primary mr-2" /> AI
                  Comparison Result
                </h3>
              </div>

              <div className="relative z-10 p-6 ">
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="o w-full text-sm text-left">
                    <thead className="bg-gradient-to-r from-primary/20 to-secondary/20">
                      <tr>
                        {comparisonresult.table?.headers.map((header, i) => (
                          <th key={i} className="px-4 py-3 font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {comparisonresult.table?.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
          <div className="mt-4 px-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
              {comparisonresult?.insights?.map((insight, i) => (
                <div
                  key={i}
                  className={`h-full flex flex-col p-4 rounded-xl ${
                    isDark
                      ? "bg-white/5 border-white/10"
                      : "bg-gradient-to-r from-primary/10  via-secondary/5 to-secondary/10 border border-primary/30"
                  } min-h-[200px] hover:border-primary/30 transition-colors`}
                >
                  <h5 className="text-lg font-bold text-primary uppercase tracking-wide mb-2">
                    {insight.title}
                  </h5>

                  <div className="flex-1 text-start overflow-hidden">
                    {insight.bullets.map((bullet, j) => {
                      const [title, ...rest] = bullet.split(":");
                      return (
                        <p
                          key={j}
                          className="text-sm dark:text-gray-300 text-gray-900 line-clamp-3"
                        >
                          <span className="font-bold">{title}: </span>
                          {rest.join(":")}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
              {comparisonresult?.tips && comparisonresult.tips.length > 0 && (
                <div className="mt-4 px-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-secondary" />
                    <h4 className="text-lg font-bold text-primary">
                      Final Recommendation
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {comparisonresult.tips.map((tip, i) => {
                      const boldMatch = tip.match(/^\*\*(.+?)\*\*\s*(.+)$/);
                      return (
                        <div
                          key={i}
                          className={`h-full flex flex-col p-4 rounded-xl ${
                            isDark
                              ? "bg-white/5 border-white/10"
                              : "bg-gradient-to-r from-primary/10 via-secondary/5 to-secondary/10 border border-primary/30"
                          } min-h-[200px] hover:border-primary/30 transition-colors`}
                        >
                          {boldMatch ? (
                            <>
                              <h5 className="text-lg font-bold text-secondary uppercase tracking-wide mb-2">
                                {boldMatch[1]}
                              </h5>
                              <p className="text-sm line-clamp-3">
                                {boldMatch[2]}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm ">{tip}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {comparisonresult?.winner && (
              <div className="py-3 flex justify-center items-center">
                <div
                  className="p-6 rounded-xl bg-gradient-to-r from-primary/10 
                    via-secondary/5 to-secondary/10 border border-primary/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                      {comparisonresult.winner.name}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {comparisonresult.winner.reasons.map((reason, i) => {
                      const boldMatch = reason.match(/^\*\*(.+?)\*\*\s*(.+)$/);
                      return (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-gray-800 dark:text-gray-300"
                        >
                          <Check className="w-4 h-4 text-green-400 mt-0.5" />
                          {boldMatch ? (
                            <>
                              <span className="font-bold">{boldMatch[1]}</span>
                              <span className="">{boldMatch[2]}</span>
                            </>
                          ) : (
                            <span>{reason}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {quotaexceeded && (
        <div className="px-10 pb-2">
          <Card className="mt-6 max-w-7xl w-full relative overflow-hidden border-0 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-primary/80 via-secondary to-primary" />
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl bg-red-500/20" />

            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-red-500/30" />

            <div className="absolute left-6 top-0 bottom-0 flex flex-col items-center">
              <div className="w-0.5 h-full bg-linear-to-b from-primary via-secondary to-primary" />
              <div className="absolute top-1/2 -translate-y-1/2">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="relative z-10 p-6 pl-20">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 " />
                <h3 className="text-xl font-bold Archivo-Black">
                  AI Quota Exceeded
                </h3>
              </div>
              <p className="italic">
                You've reached your daily AI analysis limit. Please try again
                tomorrow.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NoteComparison;
