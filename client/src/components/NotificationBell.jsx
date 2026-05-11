import { useState, useEffect, useRef } from "react";
import { Bell, X, Heart, UserPlus, MessageCircle, AtSign } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";

const getNotificationIcon = (message = "") => {
  const m = message.toLowerCase();
  if (m.includes("like")) return <Heart size={13} className="text-red-500" fill="currentColor" />;
  if (m.includes("follow")) return <UserPlus size={13} className="text-brand-500" />;
  if (m.includes("comment")) return <MessageCircle size={13} className="text-emerald-500" />;
  return <AtSign size={13} className="text-violet-500" />;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/notifications");
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/api/v1/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const markAllRead = async () => {
    await axiosInstance.put("/api/v1/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-xl transition-colors ${
          showDropdown
            ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <Bell
          size={19}
          className={unreadCount > 0 ? "animate-bell-ring" : ""}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-in shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-dropdown border border-gray-100 dark:border-gray-700/60 animate-scale-in z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-gray-500 dark:text-gray-400" />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center">
                  <Bell size={18} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm text-gray-400">All caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to="/"
                  onClick={() => markAsRead(n._id)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors border-b border-gray-50 dark:border-gray-700/30 last:border-0 ${
                    !n.read
                      ? "bg-brand-50/60 dark:bg-brand-900/10"
                      : ""
                  }`}
                >
                  {/* Icon bubble */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {n.sender?.name ? (
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {n.sender.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      getNotificationIcon(n.message)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                      {n.message}
                    </p>
                    {!n.read && (
                      <span className="inline-block w-1.5 h-1.5 bg-brand-500 rounded-full mt-1" />
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => deleteNotification(n._id, e)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5 flex-shrink-0 mt-0.5"
                  >
                    <X size={13} />
                  </button>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
