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
        className={`flex flex-col md:flex-row md:items-center md:justify-between
       gap-4 p-3 border-b-2 ${isDark ? "shadow-[0_4px_15px_rgba(206,206,206,0.7)]" : "shadow-[0_4px_15px_rgba(44,44,44,0.7)]"}`}
      >
        <div className="flex justify-between shrink-0">
          <img
            src={isDark ? DarkFlowealth : Flowealth}
            className="h-20 md:h-24 lg:h-28 xl:h-33 w-auto "
            alt="FloWealth Logo"
          />
          <NavLink
            to="/Account"
            className={({ isActive }) =>
              `border-2 md:hidden  rounded-lg p-2  ${isActive ? "border-secondary" : "border-gray-600"} mt-3`
            }
          >
            <User size={30} />
          </NavLink>
        </div>
        <div className="flex justify-center md:justify-end sm:items-center gap-6">
          <div
            className="flex justify-center md:justify-end  gap-4 Alfa-slab-one
          text-primary tracking-wider whitespace-nowrap text-xl sm:text-1xl  md:text-2xl lg:text-3xl xl:text-4xl transition-all"
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
          <NavLink
            to="/Account"
            className={({ isActive }) =>
              `border-2   rounded-lg p-1 md:h-10 ${isActive ? "border-secondary" : "border-gray-600"} invisible md:flex md:visible`
            }
          >
            <User />
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
