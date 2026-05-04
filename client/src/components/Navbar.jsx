import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, MessageCircle, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", icon: Home },
    { to: "/users", icon: Users },
    { to: "/messages", icon: MessageCircle },
    { to: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-lg font-bold text-sm shadow">
            SocialApp
          </div>
        </Link>

        {/* CENTER ICONS */}
        <div className="flex items-center gap-6 bg-gray-100 px-4 py-2 rounded-xl">
          {navItems.map(({ to, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`p-2 rounded-lg transition ${
                  active
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="flex items-center gap-2">
            <div className="avatar w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-red-500 hover:bg-red-100 p-2 rounded-lg"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
