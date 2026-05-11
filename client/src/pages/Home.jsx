import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import StoriesBar from "../components/StoriesBar";
import { Sparkles, TrendingUp, Search, X } from "lucide-react";

const PostSkeleton = () => (
  <div className="card">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 skeleton rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-28 h-3.5 skeleton rounded-md" />
        <div className="w-20 h-2.5 skeleton rounded-md" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-3 skeleton rounded-md" />
      <div className="w-4/5 h-3 skeleton rounded-md" />
      <div className="w-3/5 h-3 skeleton rounded-md" />
    </div>
    <div className="w-full h-44 skeleton rounded-xl mb-4" />
    <div className="flex gap-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
      <div className="w-14 h-6 skeleton rounded-lg" />
      <div className="w-14 h-6 skeleton rounded-lg" />
    </div>
  </div>
);

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    const res = await axiosInstance.get("/api/v1/posts");
    setPosts(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = (post) => setPosts([post, ...posts]);
  const deletePost = (id) => setPosts(posts.filter((p) => p._id !== id));
  const updatePost = (updated) =>
    setPosts(posts.map((p) => (p._id === updated._id ? updated : p)));

  const filtered = search.trim()
    ? posts.filter(
        (p) =>
          p.text?.toLowerCase().includes(search.toLowerCase()) ||
          p.user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-2xl mx-auto px-4 space-y-5">

        {/* ── Stories bar ── */}
        <StoriesBar />

        {/* ── Feed header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                Your Feed
              </h1>
              <p className="text-xs text-gray-400">Latest from the community</p>
            </div>
          </div>
          {!loading && (
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 px-3 py-1 rounded-full">
              {filtered.length} post{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Live search ── */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts or people…"
            className="input-field pl-10 pr-10 py-2.5 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Create post ── */}
        <CreatePost onPostCreated={addPost} />

        {/* ── Posts ── */}
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="card empty-state py-20 gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/30 dark:to-violet-900/30 rounded-2xl flex items-center justify-center">
              <Sparkles size={28} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">
                {search ? `No results for "${search}"` : "Nothing here yet"}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                {search
                  ? "Try a different keyword or clear the search."
                  : "Be the first to share something! Create a post above."}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((post, i) => (
            <div
              key={post._id}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
            >
              <PostCard post={post} onDelete={deletePost} onUpdate={updatePost} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
