import Flowealth from "../assets/FloWealth.png";
import DarkFlowealth from "../assets/DarkFloWealth.png";
import useDarkMode from "./Mode";
import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Avatar } from "@heroui/react";
import { User } from "lucide-react";

const NavBar = () => {
  const { isDark } = useDarkMode();
  const { user } = useAuth();

  const getInitial = (name: string) => {
    const parts = name?.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toLocaleUpperCase();
    }
    return name.slice(0, 2).toLocaleUpperCase();
  };
  return (
    // Responsive navigation with mobile-first approach
    // Switches from stacked layout (mobile) to horizontal row (md+)
    <header className="relative">
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between
       gap-4 p-3 border-b-2 ${isDark ? "shadow-[0_4px_15px_rgba(206,206,206,0.7)]" : "shadow-[0_4px_15px_rgba(44,44,44,0.7)]"}`}
      >
        <div className="flex justify-between shrink-0">
          <NavLink to="/Home">
            <img
              src={isDark ? DarkFlowealth : Flowealth}
              className="cursor-pointer h-20 md:h-24 lg:h-28 xl:h-33 w-auto "
              alt="FloWealth Logo"
            />
          </NavLink>
          {/* Mobile-only account link - shows avatar for Google users, icon for others */}
          <NavLink
            to="/Account"
            className={
              !user?.isGoogleUser
                ? `md:hidden  rounded-lg p-2   mt-3`
                : " md:hidden"
            }
          >
            <Avatar className="mt-5 md-hidden">
              {user ? (
                user?.isGoogleUser && user?.picture ? (
                  <Avatar.Image src={user.picture} alt="Profile" />
                ) : (
                  <Avatar.Fallback className="bg-secondary text-white font-bold">
                    {getInitial(user?.name || "U")}
                  </Avatar.Fallback>
                )
              ) : (
                <User />
              )}
            </Avatar>
          </NavLink>
        </div>
        <div className="flex justify-center md:justify-end sm:items-center gap-1 sm:gap-6 ">
          <div
            className="flex justify-center md:justify-end  gap-4 Alfa-slab-one overflow-x-auto  scrollbar-hide
          text-primary tracking-wider whitespace-nowrap text-lg sm:text-2xl  lg:text-3xl xl:text-4xl transition-all"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px #ad711d",
              textShadow: "0px 15px 20px rgba(0,0,0,0.3)",
            }}
          >
            <NavLink
              to="/Home"
              className={({ isActive }) =>
                `${isActive && "border-b-2 border-secondary "} shrink-0 cursor-pointer hover:opacity-80 transition-opacity`
              }
            >
              {" "}
              HOME
            </NavLink>
            <NavLink
              to="/Analytics"
              className={({ isActive }) =>
                `${isActive && "border-b-2 border-secondary "} shrink-0  cursor-pointer hover:opacity-80 transition-opacity`
              }
            >
              {" "}
              ANALYTICS
            </NavLink>
            <NavLink
              to="/Expenses"
              className={({ isActive }) =>
                `${isActive && "border-b-2 border-secondary "}shrink-0  cursor-pointer hover:opacity-80 transition-opacity`
              }
            >
              {" "}
              EXPENSES{" "}
            </NavLink>
          </div>
          {/* Desktop account link - visible on md+, handles both Google and regular users */}
          <NavLink
            to="/Account"
            className={({ isActive }) =>
              !user?.isGoogleUser
                ? `   rounded-lg p-1 md:h-10 ${
                    isActive
                  } invisible md:flex md:visible`
                : "invisible md:flex md:visible"
            }
          >
            <Avatar>
              {user ? (
                user?.isGoogleUser && user?.picture ? (
                  <Avatar.Image src={user.picture} alt="Profile" />
                ) : (
                  <Avatar.Fallback className="bg-secondary text-white font-bold">
                    {getInitial(user?.name || "U")}
                  </Avatar.Fallback>
                )
              ) : (
                <User />
              )}
            </Avatar>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
