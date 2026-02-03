import { useTheme } from "next-themes";

const useDarkMode = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  return { isDark, toggleTheme, theme };
};
export default useDarkMode;
