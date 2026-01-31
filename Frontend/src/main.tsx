import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./Context/AuthContext.tsx";
import { ThemeProvider as NextThemesProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NextThemesProvider attribute="class" defaultTheme="light">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <UserProvider>
            <App />
          </UserProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </NextThemesProvider>
  </StrictMode>,
);
