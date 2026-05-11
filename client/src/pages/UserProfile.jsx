import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  Mail,
  Calendar,
  UserPlus,
  UserMinus,
  MessageCircle,
  Users,
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

const UserProfile = () => {
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/users/${id}`);
      setProfileUser(res.data.data);
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await axiosInstance.put(`/api/v1/users/${id}/follow`);
      fetchUser();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to follow user");
    }
  };

  const handleUnfollow = async () => {
    try {
      await axiosInstance.put(`/api/v1/users/${id}/unfollow`);
      fetchUser();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to unfollow user");
    }
  };

  const isFollowing = () =>
    profileUser?.followers?.some((f) => f._id === user._id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="spinner w-10 h-10" />
        <p className="text-sm text-gray-400">Loading profile…</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card empty-state">
          <p className="text-gray-500 dark:text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  const isSelf = user._id.toString() === profileUser._id.toString();
  const gradient = getGradient(profileUser.name);
  const following = isFollowing();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="card overflow-hidden p-0 animate-slide-up">
        {/* Dynamic banner using user's avatar color */}
        <div className={`relative h-36 bg-gradient-to-r ${gradient} overflow-hidden opacity-90`}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-4 right-24 w-12 h-12 rounded-full bg-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + action buttons */}
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white dark:ring-gray-800 shadow-lg`}
            >
              {profileUser.name?.charAt(0).toUpperCase()}
            </div>

            {!isSelf ? (
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/messages/${profileUser._id}`}
                  className="btn-secondary gap-2 text-sm"
                >
                  <MessageCircle size={15} /> Message
                </Link>
                {following ? (
                  <button
                    onClick={handleUnfollow}
                    className="btn-secondary gap-2 text-sm"
                  >
                    <UserMinus size={15} /> Unfollow
                  </button>
                ) : (
                  <button onClick={handleFollow} className="btn-primary gap-2 text-sm">
                    <UserPlus size={15} /> Follow
                  </button>
                )}
              </div>
            ) : (
              <span className="mb-2 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 rounded-xl border border-brand-100 dark:border-brand-800/50">
                Your profile
              </span>
            )}
          </div>

          {/* Name + meta */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {profileUser.name}
          </h1>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mt-1">
            <Mail size={13} />
            <span>{profileUser.email}</span>
          </div>
          {profileUser.bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2.5 max-w-md leading-relaxed">
              {profileUser.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/60">
            {[
              { label: "Followers", value: profileUser.followers?.length || 0 },
              { label: "Following", value: profileUser.following?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="stat-card flex-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                  {label}
                </div>
              </div>
            ))}

            {profileUser.createdAt && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={12} />
                <span>
                  Joined{" "}
                  {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
