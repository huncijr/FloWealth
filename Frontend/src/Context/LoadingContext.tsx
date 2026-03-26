import { createContext, useContext, useState, type ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  isanimationready: boolean;
  hasInitiallyLoaded: boolean;
  setAnimationReady: () => void;
  showLoading: (immediate?: boolean) => void;
  setInitialLoadComplete: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isanimationready, setIsAnimationReady] = useState<boolean>(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const setAnimationReady = () => setIsAnimationReady(true);
  const setInitialLoadComplete = () => {
    setHasInitiallyLoaded(true);
    setIsLoading(false);
  };

  const showLoading = () => {
    if (!hasInitiallyLoaded) {
      setIsLoading(true);
    }
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        isanimationready,
        hasInitiallyLoaded,
        setAnimationReady,
        setInitialLoadComplete,
        showLoading,
        hideLoading,
      }}
    >
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
