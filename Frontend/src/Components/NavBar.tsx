import { User } from "lucide-react";
import Flowealth from "../assets/FloWealth.png";
import DarkFlowealth from "../assets/DarkFloWealth.png";
import useDarkMode from "./Mode";
import { NavLink } from "react-router-dom";
const NavBar = () => {
  const { isDark } = useDarkMode();
  return (
    <header className="relative">
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between
       gap-4 p-3 border-b-2 ${isDark ? "shadow-[0_4px_15px_rgba(206,206,206,0.7)]" : "shadow-[0_4px_15px_rgba(44,44,44,0.7)]"}`}
      >
        <div className="flex justify-between shrink-0">
          <img
            src={isDark ? DarkFlowealth : Flowealth}
            className="h-12 sm:h-20 md:h-25 lg:h-30 w-auto "
            alt="FloWealth Logo"
          />
          <div className="sm:hidden border-2 border-gray-600 rounded-lg p-2">
            <User />
          </div>
        </div>
        <div className="flex justify-center sm:justify-end sm:items-center gap-6">
          <div
            className="flex justify-center sm:justify-end  gap-4 Alfa-slab-one
          text-primary tracking-wider whitespace-nowrap sm:text-xl text-base  md:text-3xl transition-all"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px #ad711d",
              textShadow: "0px 15px 20px rgba(0,0,0,0.3)",
            }}
          >
            <NavLink
              to="/Home"
              className={({ isActive }) =>
                `${isActive && "border-b-2 border-secondary "} cursor-pointer hover:opacity-80 transition-opacity`
              }
            >
              {" "}
              Home
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${isActive && "border-b-2 border-secondary "} cursor-pointer hover:opacity-80 transition-opacity`
              }
            >
              {" "}
              ANALYTICS
            </NavLink>
            <NavLink
              to="/Account"
              className={({ isActive }) =>
                `${isActive && "border-b-2 border-secondary "} cursor-pointer hover:opacity-80 transition-opacity`
              }
            >
              {" "}
              MY EXPENSES{" "}
            </NavLink>
          </div>
          <div className="invisible sm:flex sm:visible border-2 border-gray-600 rounded-lg p-1 ">
            <User />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
