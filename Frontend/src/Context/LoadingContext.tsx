import { createContext, useContext, useState, type ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  isanimationready: boolean;
  hasInitiallyLoaded: boolean;
  hasshownlogo: boolean;
  setAnimationReady: () => void;
  showLoading: (immediate?: boolean) => void;
  setInitialLoadComplete: () => void;
  hideLoading: () => void;
  setHasShownLogo: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isanimationready, setIsAnimationReady] = useState<boolean>(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [hasshownlogo, setHasShownLogo] = useState<boolean>(false);

  const setAnimationReady = () => setIsAnimationReady(true);
  const setInitialLoadComplete = () => {
    setHasInitiallyLoaded(true);
    setIsLoading(false);
  };

  // Shows loading spinner only if logo animation hasn't been displayed yet
  // Prevents duplicate loading screens during the same session
  const showLoading = () => {
    if (!hasshownlogo) {
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
        hasshownlogo,
        showLoading,
        hideLoading,
        setHasShownLogo,
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
