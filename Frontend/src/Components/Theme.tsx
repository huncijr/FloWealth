import { Sun, MoonStar, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useDarkMode from "./Mode";
import AiChatSidebar from "./AiChatSidebar";
const Theme = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [ishovered, setIsHovered] = useState<boolean>(false);
  const [isaiOpen, setIsAiOpen] = useState(false);

  const { isDark, toggleTheme } = useDarkMode();
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <div className="p-10 gap-4 flex z-1 relative">
      <button onClick={toggleTheme}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? "dark" : "light"}
            initial={{ y: -0, rotate: -90, scale: 0.5 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: -0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Sun className="text-secondary cursor-pointer" />
            ) : (
              <MoonStar className="text-[#3b3256] cursor-pointer" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
      <button className="relative" onClick={() => setIsAiOpen(true)}>
        <AnimatePresence>
          {ishovered && (
            <>
              {/* Szétrepülő csillagok */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                    x: [0, (i - 1) * 30],
                    y: [0, -30],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.div
          className="p-2 bg-linear-to-br from-primary to-secondary rounded-xl cursor-pointer"
          whileHover={{
            scale: 1.15,
            rotate: [0, -10, 10, 0],
            boxShadow: "0 0 20px rgba(229, 134, 18, 0.6)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 10,
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.div
            animate={ishovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </button>
      <AiChatSidebar
        isopen={isaiOpen}
        onClose={() => setIsAiOpen(false)}
        note={null}
        isAnalyzing={false}
      />
    </div>
  );
};

export default Theme;
