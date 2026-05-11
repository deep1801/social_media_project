import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, MessageCircle, User, LogOut, Moon, Sun, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/users", icon: Users, label: "People" },
    { to: "/messages", icon: MessageCircle, label: "Messages" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-700/70 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-glow group-hover:scale-105 transition-all duration-300">
            <Zap size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] tracking-tight hidden sm:block">
            <span className="text-gray-900 dark:text-white">Social</span>
            <span className="gradient-text">App</span>
          </span>
        </Link>

        {/* CENTER NAV */}
        <nav className="flex items-center gap-1 bg-gray-100/90 dark:bg-gray-800/90 px-2 py-1.5 rounded-2xl">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-sm"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 2} />

                {/* Tooltip */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-medium px-2 py-0.5 bg-gray-900 dark:bg-gray-700 text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-1">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <NotificationBell />

          {/* User avatar + name */}
          <Link
            to="/profile"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-0.5"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block max-w-[80px] truncate">
              {user?.name?.split(" ")[0]}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
