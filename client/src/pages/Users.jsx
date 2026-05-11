import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";
import {
  UserPlus,
  UserMinus,
  MessageCircle,
  Users as UsersIcon,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AVATAR_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-orange-400 to-amber-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-brand-400 to-violet-500",
];

const getGradient = (name = "") => {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/users");
      const filtered = res.data.data.filter(
        (u) => u._id.toString() !== user._id.toString()
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

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Discover People
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "person" : "people"} to connect with
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people…"
            className="input-field pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state gap-4">
          <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center">
            <UsersIcon size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm text-gray-400">
            {search ? `No results for "${search}"` : "No users found"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((targetUser, i) => {
            const gradient = getGradient(targetUser.name);
            const following = isFollowing(targetUser);

            return (
              <div
                key={targetUser._id}
                className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 dark:border-gray-700/80 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                {/* Card banner */}
                <div className={`h-14 bg-gradient-to-r ${gradient} opacity-80`} />

                <div className="px-4 pb-4">
                  {/* Avatar row */}
                  <div className="-mt-6 mb-3 flex items-end justify-between">
                    <Link to={`/user/${targetUser._id}`}>
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg ring-3 ring-white dark:ring-gray-800 shadow-sm hover:scale-105 transition-transform`}
                      >
                        {targetUser.name?.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    {following && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                        Following
                      </span>
                    )}
                  </div>

                  {/* Name + followers */}
                  <Link to={`/user/${targetUser._id}`} className="block mb-1 group">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">
                      {targetUser.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-2.5">
                    {targetUser.followers?.length || 0} follower{targetUser.followers?.length !== 1 ? "s" : ""}
                  </p>

                  {/* Bio */}
                  {targetUser.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                      {targetUser.bio}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/messages/${targetUser._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-xl py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <MessageCircle size={13} />
                      Message
                    </Link>

                    {following ? (
                      <button
                        onClick={() => handleUnfollow(targetUser._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 rounded-xl py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        <UserMinus size={13} />
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(targetUser._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl py-2 text-xs font-semibold hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors shadow-sm"
                      >
                        <UserPlus size={13} />
                        Follow
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Users;
