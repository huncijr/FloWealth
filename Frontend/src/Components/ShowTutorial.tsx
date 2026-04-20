import { Button, Card, CardHeader, Chip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  NotebookPen,
  Palette,
  ScanLine,
  ScanSearch,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect } from "react";

interface ShowTutorialProps {
  isopen: boolean;
  onClose: () => void;
}

const ShowTutorial: React.FC<ShowTutorialProps> = ({ isopen, onClose }) => {
  useEffect(() => {
    if (!isopen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isopen, onClose]);

  return (
    <AnimatePresence>
      {isopen && (
        <div className="fixed inset-0 z-80">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative w-full max-w-7xl overflow-hidden border-0 shadow-2xl">
              <CardHeader className="relative z-10 flex items-start justify-between gap-3 px-6 py-5 border-b border-white/10">
                <div className="flex pt-10 sm:p-2 items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-primary to-secondary rounded-xl">
                    <Sparkles className="sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11" />
                  </div>
                  <div className="leading-tight">
                    <p className="tracking-wide Artifika font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                      Get started guide
                    </p>
                    <p className="Artifika text-lg sm:text-xl md:text-2xl lg:text-3xl">
                      {" "}
                      Track and analyze your spendings.
                    </p>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="flex gap-4">
                    <Chip color="accent">Tips</Chip>
                    <Button variant="ghost" onClick={onClose}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="relative z-10 px-6 ">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
                    <Palette className="sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11 text-secondary" />
                    <span className="font-semibold text-lg sm:text-xl lg:text-2xl">
                      Theme
                    </span>
                  </div>
                  <span className="text-gray-500 font-bold text-3xl">•</span>{" "}
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
                    <NotebookPen className="sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11 text-primary" />
                    <span className="font-semibold text-lg sm:text-xl lg:text-2xl">
                      Notes
                    </span>
                  </div>
                  <span className="text-gray-500 font-bold text-3xl">•</span>{" "}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
                    <Bot className="sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11 text-primary" />
                    <span className="font-semibold text-lg sm:text-xl lg:text-2xl">
                      AI
                    </span>
                  </div>
                </div>
              </div>
              <div className="ai-flow ai-flow--once">
                {/* STEP 1 */}
                <div className="ai-step ai-step--1">
                  <div className="ai-step__iconWrap">
                    <div className="ai-step__iconBg from-primary to-secondary">
                      <Palette className="ai-step__icon" />
                    </div>
                  </div>

                  <div className="ai-step__text">
                    <p className="ai-step__title ">Create a theme</p>
                    <p className="ai-step__desc ">
                      Start by grouping expenses.
                    </p>
                  </div>
                </div>

                {/* ARROW 1 */}
                <div className="ai-arrow ai-arrow--1" aria-hidden="true">
                  <span className="ai-arrow__shaft" />
                  <span className="ai-arrow__head" />
                </div>

                {/* STEP 2 */}
                <div className="ai-step ai-step--2">
                  <div className="ai-step__iconWrap">
                    <div className="ai-step__iconBg from-secondary to-primary">
                      <NotebookPen className="ai-step__icon" />
                    </div>
                  </div>

                  <div className="ai-step__text">
                    <p className="ai-step__title ">
                      Create a shopping list using AI
                    </p>
                    <p className="ai-step__desc ">
                      Let the assistant generate items.
                    </p>
                  </div>
                </div>

                {/* ARROW 2 */}
                <div className="ai-arrow ai-arrow--2" aria-hidden="true">
                  <span className="ai-arrow__shaft" />
                  <span className="ai-arrow__head" />
                </div>

                {/* STEP 3 */}
                <div className="ai-step ai-step--3">
                  <div className="ai-step__iconWrap">
                    <div className="ai-step__iconBg from-primary to-secondary">
                      <Upload className="ai-step__icon" />
                    </div>
                  </div>

                  <div className="ai-step__text">
                    <p className="ai-step__title ">
                      Finish it & upload a picture
                    </p>
                    <p className="ai-step__desc ">
                      Add receipt photo for analysis.
                    </p>
                  </div>
                </div>

                {/* ARROW 3 */}
                <div className="ai-arrow ai-arrow--3" aria-hidden="true">
                  <span className="ai-arrow__shaft" />
                  <span className="ai-arrow__head" />
                </div>

                {/* STEP 4 (SPLIT) */}
                <div className="ai-step ai-step--4">
                  <div className="ai-step__iconWrap">
                    <div className="ai-step__iconBg from-secondary to-primary">
                      <Sparkles className="ai-step__icon" />
                    </div>
                  </div>

                  <div className="ai-step__text">
                    <p className="ai-step__title ">AI actions</p>
                    <p className="ai-step__desc ">
                      Branch into analysis or comparison.
                    </p>
                  </div>

                  <div className="ai-split" aria-hidden="true">
                    <div className="ai-branch ai-branch--up">
                      <div className="sm:mt-4 ai-branch__node">
                        <ScanSearch className="w-4 h-4 " />
                        <span>Analyze with AI</span>
                      </div>
                    </div>

                    <div className="ai-branch ai-branch--down">
                      <div className="mb-2 ai-branch__node">
                        <ScanLine className="w-4 h-4 " />
                        <span>Compare note</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShowTutorial;
