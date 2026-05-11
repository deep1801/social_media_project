import { useAuth } from "../context/AuthContext";
import { Mail, Calendar, FileText, Users, Sparkles } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Hero card */}
      <div className="card overflow-hidden p-0 animate-slide-up">
        {/* Banner */}
        <div className="relative h-36 bg-gradient-to-r from-brand-500 via-brand-600 to-violet-600 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-4 right-24 w-12 h-12 rounded-full bg-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + edit area */}
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <div className="avatar w-24 h-24 text-4xl font-bold ring-4 ring-white dark:ring-gray-800 shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="mb-2 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 rounded-xl border border-brand-100 dark:border-brand-800/50">
              My Profile
            </span>
          </div>

          {/* Name + meta */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mt-1">
                <Mail size={13} />
                <span>{user.email}</span>
              </div>
              {user.bio && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2.5 max-w-md leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0 mt-1">
                <Calendar size={12} />
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
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/60">
            {[
              { label: "Followers", value: user.followers?.length || 0, icon: Users },
              { label: "Following", value: user.following?.length || 0, icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="stat-card flex-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posts section */}
      <div className="mt-6 animate-slide-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <FileText size={20} className="text-brand-500" />
            Your Posts
          </h2>
        </div>

        <div className="card empty-state py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 flex items-center justify-center">
            <Sparkles size={24} className="text-brand-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              No posts yet
            </p>
            <p className="text-sm text-gray-400">
              Your shared posts will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
