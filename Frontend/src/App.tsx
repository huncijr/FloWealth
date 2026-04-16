import Home from "./Pages/Home";
import Expenses from "./Pages/ExpensesPage";
import AnalyticsPage from "./Pages/AnalyticsPage";
import Login from "./Pages/Login";
import NotFoundPage from "./Pages/NotFoundPage";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import "./index.css";
import NavBar from "./Components/NavBar";
import Theme from "./Components/Theme";
import useDarkMode from "./Components/Mode";
import { LoadingProvider } from "./Context/LoadingContext";
import { ThemeProvider } from "./Context/ThemeContext";
import { NotesProvider } from "./Context/Notescontext";
import Footer from "./Components/Footer";
import TermsConditions from "./Pages/Terms&Conditions";

const NavBarLayout = () => {
  const { isDark } = useDarkMode();

  return (
    <main
      className={`${isDark ? "bg-main-bg" : "bg-main-foreground"} min-h-screen `}
    >
      <div className="flex flex-col relative">
        <NavBar />
        <div className="absolute top-full right-4 mt-2">
          <Theme />
        </div>
      </div>
      <div>
        <Outlet />
      </div>
      <div className="fixed bottom-0 left-0 right-0">
        <Footer />
      </div>
    </main>
  );
};
function App() {
  return (
    <LoadingProvider>
      <ThemeProvider>
        <NotesProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route element={<NavBarLayout />}>
              <Route path="/Home" element={<Home />} />
              <Route path="/Expenses" element={<Expenses />} />
              <Route path="/Analytics" element={<AnalyticsPage />} />
              <Route path="/Account" element={<Login />} />
              <Route path="/Terms&Conditions" element={<TermsConditions />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotesProvider>
      </ThemeProvider>
    </LoadingProvider>
  );
}

export default App;
