import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (immediate?: boolean) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedBefore = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLoading = (immediate: boolean = false) => {
    if (hasLoadedBefore.current || immediate) {
      setIsLoading(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(true);
      }, 5000);
    }
  };

  const hideLoading = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
    hasLoadedBefore.current = true;
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
};
