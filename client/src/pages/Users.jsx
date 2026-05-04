import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";
import {
  UserPlus,
  UserMinus,
  MessageCircle,
  Users as UsersIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/users");
      const filtered = res.data.data.filter(
        (u) => u._id.toString() !== user._id.toString(),
      );
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    await axiosInstance.put(`/api/v1/users/${userId}/follow`);
    fetchUsers();
  };

  const handleUnfollow = async (userId) => {
    await axiosInstance.put(`/api/v1/users/${userId}/unfollow`);
    fetchUsers();
  };

  const isFollowing = (targetUser) => targetUser.followers?.includes(user._id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="spinner w-10 h-10" />
        <p className="text-sm text-gray-400">Finding people…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Discover People
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {users.length} people available
        </p>
      </div>

      {users.length === 0 ? (
        <div className="card empty-state">
          <UsersIcon size={40} className="text-gray-200 mb-3" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((targetUser) => (
            <div
              key={targetUser._id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-slate-700 group"
            >
              {/* CLICKABLE PROFILE AREA */}
              <Link
                to={`/user/${targetUser._id}`}
                className="flex items-center gap-3 mb-4"
              >
                <div className="avatar w-12 h-12 text-lg group-hover:scale-105 transition">
                  {targetUser.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-500">
                    {targetUser.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {targetUser.followers?.length || 0} followers
                  </p>
                </div>
              </Link>

              {/* BIO */}
              {targetUser.bio && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {targetUser.bio}
                </p>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                <Link
                  to={`/messages/${targetUser._id}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 rounded-lg py-2 text-xs hover:bg-blue-100"
                >
                  <MessageCircle size={14} />
                  Message
                </Link>

                {isFollowing(targetUser) ? (
                  <button
                    onClick={() => handleUnfollow(targetUser._id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-xs hover:bg-gray-200"
                  >
                    <UserMinus size={14} />
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(targetUser._id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg py-2 text-xs hover:bg-blue-700"
                  >
                    <UserPlus size={14} />
                    Follow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
