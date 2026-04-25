import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, Users, MessageCircle } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">SocialApp</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              to="/users"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users size={20} />
              <span className="hidden sm:inline">People</span>
            </Link>

            <Link
              to="/messages"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="hidden sm:inline">Messages</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User size={20} />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <NotificationBell />

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {user && (
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
