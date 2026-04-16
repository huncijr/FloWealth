import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { api } from "../api/axiosInstance";
import { useLoading } from "./LoadingContext";

export interface Theme {
  id: number;
  name: string;
  color: string;
}

interface ThemeContextState {
  themes: Theme[];
  isloading: boolean;
  error: string | null;
  themeStats: any[];
  refreshThemes: () => Promise<void>;
  addTheme: (theme: Theme) => void;
  removeTheme: (id: number) => void;
  updateTheme: (theme: Theme[]) => void;
  refreshThemeStats: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isanimationready, hasInitiallyLoaded } = useLoading();
  const { user } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [themeStats, setThemeStats] = useState<any[]>([]);

  // Fetches user's themes from backend, called on initial load and refresh
  // Only executes when user is authenticated
  const fetchThemes = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/gettheme");
      if (response.data.success) {
        let themes = response.data.allthemes;
        setThemes(themes);
      }
    } catch (error) {
      setError("Failed to fetch themes");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !hasFetched) {
      fetchThemes();
      setHasFetched(true);
    }
  }, [user, hasFetched, isanimationready, hasInitiallyLoaded, fetchThemes]);

  useEffect(() => {
    if (!user) {
      setThemes([]);
      setHasFetched(false);
    }
  }, [user]);

  const refreshThemes = useCallback(async () => {
    await fetchThemes();
  }, [fetchThemes]);

  const addTheme = useCallback((newTheme: Theme) => {
    setThemes((prev) => [...prev, newTheme]);
  }, []);

  const removeTheme = useCallback((themesid: number) => {
    setThemes((prev) => prev.filter((p) => p.id != themesid));
  }, []);

  const updateTheme = useCallback((newThemes: Theme[]) => {
    setThemes(newThemes);
  }, []);

  const refreshThemeStats = useCallback(async () => {
    if (!user) return;
    const response = await api.get("/themestats");
    // console.log(response.data);
    if (response.data.success) {
      setThemeStats(response.data.stats);
    }
  }, [user]);

  const value: ThemeContextState = {
    themes,
    isloading,
    error,
    refreshThemes,
    addTheme,
    removeTheme,
    updateTheme,
    themeStats,
    refreshThemeStats,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemes = (): ThemeContextState => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemes must be used within a ThemeProvider");
  }
  return context;
};
