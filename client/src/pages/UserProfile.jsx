import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  Mail,
  Calendar,
  UserPlus,
  UserMinus,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  const isSelf = user._id.toString() === profileUser._id.toString();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="card overflow-hidden p-0">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-violet-500 via-brand-600 to-brand-500" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="avatar w-20 h-20 text-3xl font-bold ring-4 ring-white shadow-md">
              {profileUser.name?.charAt(0).toUpperCase()}
            </div>

            {!isSelf && (
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/messages/${profileUser._id}`}
                  className="btn-secondary gap-2"
                >
                  <MessageCircle size={16} /> Message
                </Link>
                {isFollowing() ? (
                  <button
                    onClick={handleUnfollow}
                    className="btn-secondary gap-2"
                  >
                    <UserMinus size={16} /> Unfollow
                  </button>
                ) : (
                  <button onClick={handleFollow} className="btn-primary gap-2">
                    <UserPlus size={16} /> Follow
                  </button>
                )}
              </div>
            )}
            {isSelf && (
              <span className="text-xs text-gray-400 mb-2 px-3 py-1.5 bg-gray-100 rounded-xl">
                Your profile
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {profileUser.name}
          </h1>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
            <Mail size={14} />
            <span>{profileUser.email}</span>
          </div>
          {profileUser.bio && (
            <p className="text-gray-600 text-sm mt-2 max-w-md">
              {profileUser.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: "Followers", value: profileUser.followers?.length || 0 },
              { label: "Following", value: profileUser.following?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}

            {profileUser.createdAt && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={13} />
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
