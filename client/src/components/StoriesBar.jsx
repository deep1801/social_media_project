import { useState, useEffect } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-orange-400 to-amber-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-brand-400 to-violet-500",
];

const getGradient = (name = "") => {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[code % GRADIENTS.length];
};

// ── Story Viewer ──────────────────────────────────────────────────────────────
const StoryViewer = ({ story, onClose, onNext, onPrev, hasPrev, hasNext }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          if (hasNext) onNext();
          else onClose();
          return 100;
        }
        return p + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [story._id]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="mb-3 px-1">
          <div className="w-full h-0.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%`, transition: "width 0.05s linear" }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${story.gradient}`}
          style={{ aspectRatio: "9/16", maxHeight: "78vh" }}
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="absolute rounded-full border-2 border-white"
                style={{ width: n * 120, height: n * 120 }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-white font-bold ring-2 ring-white/40">
                {story.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  {story.name}
                </p>
                <p className="text-white/60 text-xs">just now</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Main content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8 text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-bold text-white mb-6 ring-4 ring-white/30 shadow-2xl animate-bounce-in">
              {story.name?.charAt(0).toUpperCase()}
            </div>
            {story.latestPost ? (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl px-5 py-4 max-w-[260px]">
                <p className="text-white text-[15px] font-medium leading-relaxed">
                  "{story.latestPost.slice(0, 140)}
                  {story.latestPost.length > 140 ? "…" : ""}"
                </p>
              </div>
            ) : (
              <p className="text-white/60 text-sm">No recent posts</p>
            )}
          </div>

          {/* Tap zones */}
          <div className="absolute inset-0 flex z-20">
            <button
              className="w-1/3 h-full"
              onClick={(e) => {
                e.stopPropagation();
                if (hasPrev) onPrev();
              }}
            />
            <button
              className="w-2/3 h-full"
              onClick={(e) => {
                e.stopPropagation();
                if (hasNext) onNext();
                else onClose();
              }}
            />
          </div>
        </div>

        {/* Arrow nav */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute -left-11 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute -right-11 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

// ── StoriesBar ────────────────────────────────────────────────────────────────
const StoriesBar = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [viewingIndex, setViewingIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, postsRes] = await Promise.all([
          axiosInstance.get("/api/v1/users"),
          axiosInstance.get("/api/v1/posts"),
        ]);
        const users = usersRes.data.data || [];
        const posts = postsRes.data.data || [];

        const storyData = users
          .filter((u) => u._id !== user?._id)
          .map((u) => ({
            ...u,
            gradient: getGradient(u.name),
            latestPost:
              posts.find((p) => p.user?._id === u._id)?.text || null,
          }));

        setStories(storyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  return (
    <>
      <div className="card py-4 px-4">
        <div
          className="flex items-center gap-4 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Your story bubble */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="w-[58px] h-[58px] rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold ring-[2.5px] ring-brand-300 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 group-hover:scale-105 transition-transform shadow-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-brand-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                <Plus size={9} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium w-14 truncate text-center">
              Your Story
            </span>
          </div>

          {/* Divider */}
          {(loading || stories.length > 0) && (
            <div className="h-10 w-px bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
          )}

          {/* Skeleton */}
          {loading &&
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="w-[58px] h-[58px] skeleton rounded-full" />
                <div className="w-12 h-2.5 skeleton rounded-md" />
              </div>
            ))}

          {/* Story bubbles */}
          {!loading &&
            stories.map((story, i) => (
              <div
                key={story._id}
                onClick={() => setViewingIndex(i)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              >
                {/* Gradient ring = "new story" indicator */}
                <div
                  className="w-[58px] h-[58px] rounded-full p-[2.5px] group-hover:scale-105 transition-transform"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  }}
                >
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${story.gradient} flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {story.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium w-14 truncate text-center">
                  {story.name?.split(" ")[0]}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Story viewer modal */}
      {viewingIndex !== null && stories[viewingIndex] && (
        <StoryViewer
          story={stories[viewingIndex]}
          onClose={() => setViewingIndex(null)}
          onNext={() =>
            viewingIndex < stories.length - 1
              ? setViewingIndex((i) => i + 1)
              : setViewingIndex(null)
          }
          onPrev={() =>
            viewingIndex > 0 ? setViewingIndex((i) => i - 1) : null
          }
          hasPrev={viewingIndex > 0}
          hasNext={viewingIndex < stories.length - 1}
        />
      )}
    </>
  );
};

export default StoriesBar;
