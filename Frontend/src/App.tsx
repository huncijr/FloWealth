import Home from "./Pages/Home";
import Login from "./Pages/Login";
import NotFoundPage from "./Pages/NotFoundPage";
import { Route, Routes, Outlet } from "react-router-dom";
import "./index.css";
import NavBar from "./Components/NavBar";
import Theme from "./Components/Theme";
const NavBarLayout = () => {
  return (
    <>
      <main>
        <NavBar />
        <Theme />
        <Outlet />
      </main>
    </>
  );
};
function App() {
  return (
    <Routes>
      <Route element={<NavBarLayout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/Account" element={<Login />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
