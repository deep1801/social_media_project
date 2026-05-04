import { useAuth } from "../context/AuthContext";
import { Mail, Calendar, Users } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Hero card */}
      <div className="card overflow-hidden p-0">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-brand-500 via-brand-600 to-violet-600" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4">
            <div className="avatar w-20 h-20 text-3xl font-bold ring-4 ring-white shadow-md">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
              {user.bio && (
                <p className="text-gray-600 text-sm mt-2 max-w-md">
                  {user.bio}
                </p>
              )}
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                <Calendar size={13} />
                <span>
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: "Followers", value: user.followers?.length || 0 },
              { label: "Following", value: user.following?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posts placeholder */}
      <div className="mt-6">
        <h2 className="section-title mb-4">Your Posts</h2>
        <div className="card empty-state">
          <Users size={36} className="text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Your posts will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
