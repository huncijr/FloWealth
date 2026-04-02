import { useEffect, useState } from "react";
import useDarkMode from "../Components/Mode";
import { useAuth } from "../Context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useNotes } from "../Context/Notescontext";
import { useThemes, type Theme } from "../Context/ThemeContext";
import AnalyticChart from "../Components/AnalyticChart";
import SkeletonLoading from "../Components/SkeletonLoading";

// Extends Theme type to include virtual themes (e.g., "No theme" pseudo-theme)
type ThemeWithVirtual = Theme & { isVirtual?: boolean };

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { isDark } = useDarkMode();

  const [issidebaropen, setIsSidebarOpen] = useState(false);
  const [isloading, setisLoading] = useState(false);

  const { themes, refreshThemes, isloading: themesLoading } = useThemes();
  const { notes, refreshNotes, isloading: notesLoading } = useNotes();
  const [hasFetchedLocally, setHasFetchedLocally] = useState<boolean>(false);

  useEffect(() => {
    if (!hasFetchedLocally) {
      setHasFetchedLocally(true);
      refreshThemes();
      refreshNotes();
    }
  }, []);

  useEffect(() => {
    setisLoading(notesLoading || themesLoading);
  }, [notesLoading, themesLoading]);

  const completedCount = notes.filter((n) => n.completed);

  return (
    <div>
      {!isloading ? (
        user ? (
          themes.length > 0 || completedCount.length == 0 ? (
            completedCount.length > 0 ? (
              <div className="flex py-20 sm:p-5 w-full ">
                <div className=" flex flex-col w-full justify-around">
                  <h1
                    className="Abril-Fatface text-3xl sm:text-4xl md:text-5xl text-primary 
                 w-fit mx-auto sm:mx-0 transition-all duration-300 ease-in-out"
                  >
                    Welcome, {user.name} !
                  </h1>
                  <div className="flex mt-3 items-center gap-4">
                    <div className="relative  ">
                      <AnimatePresence mode="wait">
                        {!issidebaropen ? (
                          <motion.button
                            key="menu"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-primary/20 rounded-full transition-colors"
                          >
                            <Menu
                              size={28}
                              className="text-primary cursor-pointer"
                            />
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
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className={`${isDark ? "bg-gray-600 border-gray-900" : "bg-white border-gray-200"} 
    border-r-4 border-b-4 mx-1 sm:mx-auto rounded-br-lg rounded-tr-lg min-h-screen max-h-screen flex flex-col `}
                              style={{
                                width: "clamp(280px,85vw,350px)",
                                position: "absolute",
                                left: 0,
                                top: 0,
                                zIndex: 50,
                              }}
                            >
                              <div
                                className={`flex items-center justify-between p-6 border-b  ${isDark ? "bg-gray-600 border-b-gray-500" : "bg-white border-gray-200"}`}
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
                                  {/* IIFE that renders sidebar statistics grouped by theme
                                      Creates a virtual "No theme" entry if there are notes without themes */}
                                  {(() => {
                                    const noThemeNotes = notes.filter(
                                      (n) =>
                                        n.theme === "No theme " && n.completed,
                                    );

                                    const allThemes: ThemeWithVirtual[] = [
                                      ...(noThemeNotes.length > 0
                                        ? [
                                            {
                                              id: 0,
                                              name: "No theme ",
                                              color: "#9ca3af",
                                              isVirtual: true,
                                            },
                                          ]
                                        : []),
                                      ...themes,
                                    ];

                                    return allThemes.map((theme, i) => {
                                      const themeNotes = theme.isVirtual
                                        ? notes.filter(
                                            (n) =>
                                              n.theme === "No theme " &&
                                              n.completed,
                                          )
                                        : notes.filter(
                                            (n) =>
                                              n.theme === theme.name &&
                                              n.completed,
                                          );

                                      // Sort notes by cost (actual or estimated) and take top 3 most expensive
                                      const mostlycosted = themeNotes
                                        .map((note) => ({
                                          ...note,
                                          effectiveCost: note.cost
                                            ? parseFloat(note.cost)
                                            : parseFloat(note.estcost),
                                        }))
                                        .sort(
                                          (a, b) =>
                                            b.effectiveCost - a.effectiveCost,
                                        )
                                        .slice(0, 3);

                                      if (mostlycosted.length === 0)
                                        return null;

                                      return (
                                        <div
                                          key={theme.id}
                                          className="space-y-4"
                                        >
                                          <div
                                            className={`flex items-center justify-center gap-3 ${theme.isVirtual ? "opacity-70" : ""}`}
                                          >
                                            <div
                                              className="w-3 h-3 rounded-full"
                                              style={{
                                                backgroundColor: theme.color,
                                              }}
                                            />
                                            <h3
                                              className={`font-[Abril_Fatface] text-xl ${theme.isVirtual ? "text-gray-500" : "text-primary"}`}
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
                                                  isDark
                                                    ? "bg-gray-700"
                                                    : "bg-gray-200"
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
                                                      ? new Intl.NumberFormat(
                                                          "en-US",
                                                          {
                                                            style: "currency",
                                                            currency: "USD",
                                                          },
                                                        ).format(
                                                          Number(note.cost),
                                                        )
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

                                          {i < allThemes.length - 1 && (
                                            <div className="border-b-2 border-primary/20 pt-4" />
                                          )}
                                        </div>
                                      );
                                    });
                                  })()}
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
            ) : (
              <div>You currently dont have completed any notes</div>
            )
          ) : (
            <div>You currently dont have any themes!</div>
          )
        ) : (
          <div>Make an account</div>
        )
      ) : (
        <div className="pt-10 w-full">
          <SkeletonLoading />
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
