import { Sun, MoonStar } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useDarkMode from "./Mode";
const Theme = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const { isDark, toggleTheme } = useDarkMode();
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <div className="p-10">
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
    </div>
  );
};

export default Theme;
