import Home from "./Pages/Home";
import Expenses from "./Pages/ExpensesPage";
import Login from "./Pages/Login";
import NotFoundPage from "./Pages/NotFoundPage";
import { Route, Routes, Outlet } from "react-router-dom";
import "./index.css";
import NavBar from "./Components/NavBar";
import Theme from "./Components/Theme";
import useDarkMode from "./Components/Mode";
const NavBarLayout = () => {
  const { isDark } = useDarkMode();
  return (
    <main className={`${isDark ? "bg-main-bg" : "bg-main-foreground"}`}>
      <div className="flex flex-col relative">
        <NavBar />
        <div className="absolute top-full right-4 mt-2">
          <Theme />
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </main>
  );
};
function App() {
  return (
    <Routes>
      <Route element={<NavBarLayout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/Expenses" element={<Expenses />} />
        <Route path="/Account" element={<Login />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
