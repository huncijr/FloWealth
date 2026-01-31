import { Sun, MoonStar } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
const Theme = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  const isDark = theme === "dark";
  return (
    <div>
      <button onClick={() => setTheme(isDark ? "light" : "dark")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? "dark" : "light"}
            initial={{ y: -0, rotate: -90, scale: 0.5 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: -0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <MoonStar className="text-[#3b3256]" />
            ) : (
              <Sun className="text-main-foreground" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
  );
};

export default Theme;
