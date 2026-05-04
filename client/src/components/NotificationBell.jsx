import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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

  // ✅ mark read (instant UI update)
  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/api/v1/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DELETE FIX (IMPORTANT)
  const deleteNotification = async (id, e) => {
    e.preventDefault(); // 🚀 LINK ko rokega
    e.stopPropagation(); // 🚀 bubbling rokega

    try {
      await axiosInstance.delete(`/api/v1/notifications/${id}`);

      // ✅ UI instantly update
      setNotifications((prev) => prev.filter((n) => n._id !== id));

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📦 Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border animate-fade-in z-50">
          {/* Header */}
          <div className="p-3 font-semibold border-b flex justify-between items-center">
            Notifications
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  await axiosInstance.put("/api/v1/notifications/read-all");

                  // instant update
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true })),
                  );
                  setUnreadCount(0);
                }}
                className="text-xs text-blue-500"
              >
                Mark all
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to="/"
                  onClick={() => markAsRead(n._id)}
                  className={`flex gap-3 p-3 hover:bg-gray-50 transition ${
                    !n.read ? "bg-blue-50" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {n.sender?.name?.charAt(0) || "U"}
                  </div>

                  {/* Message */}
                  <div className="flex-1 text-sm">
                    <p>{n.message}</p>
                  </div>

                  {/* ❌ Delete */}
                  <button
                    onClick={(e) => deleteNotification(n._id, e)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
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
