import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  MessageCircle,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSentiment } from "../helper/huggingFaceSentiment";

const BASE_URL = "https://social-media-project-si7w.onrender.com";

// ── Utilities ─────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const renderText = (text) => {
  if (!text) return null;
  const parts = text.split(/(#\w+|@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#"))
      return (
        <span
          key={i}
          className="text-brand-500 dark:text-brand-400 hover:text-brand-600 cursor-pointer font-semibold"
        >
          {part}
        </span>
      );
    if (part.startsWith("@"))
      return (
        <span
          key={i}
          className="text-violet-500 dark:text-violet-400 hover:text-violet-600 cursor-pointer font-semibold"
        >
          {part}
        </span>
      );
    return <span key={i}>{part}</span>;
  });
};

// ── Emoji Reactions ───────────────────────────────────────────────────────────
const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "👍", label: "Like" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
];

const REACTION_COLORS = {
  "❤️": "text-red-500 bg-red-50 dark:bg-red-900/20",
  "👍": "text-brand-500 bg-brand-50 dark:bg-brand-900/20",
  "😂": "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
  "😮": "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  "😢": "text-sky-500 bg-sky-50 dark:bg-sky-900/20",
  "😡": "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
};

const getStoredReaction = (postId, userId) =>
  localStorage.getItem(`reaction_${postId}_${userId}`);

const setStoredReaction = (postId, userId, emoji) => {
  if (emoji) localStorage.setItem(`reaction_${postId}_${userId}`, emoji);
  else localStorage.removeItem(`reaction_${postId}_${userId}`);
};

// ── Sentiment Panel ───────────────────────────────────────────────────────────
const COLOR = {
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/50",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-400",
    light: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800/50",
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-400",
    light: "bg-red-100 dark:bg-red-900/30",
  },
  yellow: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/50",
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-400",
    light: "bg-amber-100 dark:bg-amber-900/30",
  },
  gray: {
    bg: "bg-gray-50 dark:bg-gray-800/50",
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-600 dark:text-gray-400",
    bar: "bg-gray-300 dark:bg-gray-600",
    light: "bg-gray-100 dark:bg-gray-700/50",
  },
};

const SentimentPanel = ({ sentiment, loading }) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 mb-3 animate-pulse">
        <div className="w-6 h-6 rounded-full skeleton" />
        <div className="w-24 h-3 skeleton rounded-md" />
        <div className="w-16 h-3 skeleton rounded-md" />
      </div>
    );
  }

  if (!sentiment) return null;

  const c = COLOR[sentiment.color] || COLOR.gray;
  const pct = Math.round((sentiment.confidence || 0) * 100);

  return (
    <div
      className={`mb-3 rounded-xl border ${c.border} ${c.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="text-xl leading-none">{sentiment.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${c.text}`}>
              {sentiment.mood}
            </span>
            <span className="text-[10px] text-gray-400">{pct}% confidence</span>
          </div>
          <div className="mt-1 w-full h-1.5 rounded-full bg-white/60 dark:bg-black/20 overflow-hidden">
            <div
              className={`h-full rounded-full ${c.bar} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className={`text-xs ${c.text} flex-shrink-0`}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className={`px-3 pb-3 border-t ${c.border} pt-2.5 space-y-2`}>
          {sentiment.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold">Analysis: </span>
              {sentiment.description}
            </p>
          )}
          {sentiment.suggestion && (
            <div
              className={`flex items-start gap-2 px-2.5 py-2 rounded-lg ${c.light}`}
            >
              <span className="text-sm">💡</span>
              <p className={`text-xs font-medium ${c.text} leading-relaxed`}>
                {sentiment.suggestion}
              </p>
            </div>
          )}
          <div className="flex items-center gap-4 pt-1">
            {[
              { label: "Positive", color: "bg-emerald-400", key: "positive" },
              { label: "Negative", color: "bg-red-400", key: "negative" },
            ].map(({ label, color, key }) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">{label}</span>
                <div className="w-16 h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{
                      width: `${Math.round((sentiment.raw?.[key] || 0) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">
                  {Math.round((sentiment.raw?.[key] || 0) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── PostCard ──────────────────────────────────────────────────────────────────
const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [sentimentLoad, setSentimentLoad] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [commentSentiments, setCommentSentiments] = useState({});
  const pickerTimeout = useRef(null);

  const isLiked = post.likes?.some((like) => like.user === user?._id);
  const isOwner = post.user?._id === user?._id;
  const myReaction = getStoredReaction(post._id, user?._id);
  const activeReactionColor = myReaction
    ? REACTION_COLORS[myReaction] || REACTION_COLORS["❤️"]
    : "";

  useEffect(() => {
    if (!post.text?.trim()) return;
    setSentimentLoad(true);
    getSentiment(post.text)
      .then((res) => setSentiment(res))
      .catch(() => setSentiment(null))
      .finally(() => setSentimentLoad(false));
  }, [post._id]);

  useEffect(() => {
    if (!showComments || !post.comments?.length) return;
    post.comments.forEach((c) => {
      if (!c.text?.trim() || commentSentiments[c._id]) return;
      getSentiment(c.text)
        .then((res) => {
          if (res) setCommentSentiments((prev) => ({ ...prev, [c._id]: res }));
        })
        .catch(() => {});
    });
  }, [showComments, post.comments]);

  const triggerLike = async (emoji = null) => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 380);
    setShowPicker(false);

    try {
      const endpoint = isLiked && !emoji ? "unlike" : "like";
      if (emoji) setStoredReaction(post._id, user?._id, emoji);
      else if (isLiked) setStoredReaction(post._id, user?._id, null);

      const res = await axiosInstance.put(
        `/api/v1/posts/${post._id}/${endpoint}`,
      );
      onUpdate(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickerEnter = () => {
    clearTimeout(pickerTimeout.current);
    setShowPicker(true);
  };

  const handlePickerLeave = () => {
    pickerTimeout.current = setTimeout(() => setShowPicker(false), 200);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axiosInstance.delete(`/api/v1/posts/${post._id}`);
      onDelete(post._id);
    } catch {
      alert("Delete failed");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `/api/v1/posts/${post._id}/comments`,
        {
          text: commentText,
        },
      );
      onUpdate(res.data?.data || res.data);
      setCommentText("");
    } catch {
      alert("Comment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axiosInstance.delete(
        `/api/v1/posts/${post._id}/comments/${commentId}`,
      );
      onUpdate(res.data?.data || res.data);
    } catch {
      alert("Delete comment failed");
    }
  };

  return (
    <div className="card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="avatar w-9 h-9 text-sm shadow-sm">
            {post.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              {post.user?.name}
            </p>
            <p className="text-[11px] text-gray-400">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Text with hashtag + mention highlights */}
      {post.text && (
        <p className="text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
          {renderText(post.text)}
        </p>
      )}

      {/* Sentiment */}
      <SentimentPanel sentiment={sentiment} loading={sentimentLoad} />

      {/* Image */}
      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          className="rounded-xl mb-3 w-full max-h-96 object-cover border border-gray-100 dark:border-gray-700/60 shadow-sm"
          alt="post"
        />
      )}

      {/* Actions row */}
      <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-gray-700/60">
        {/* Reaction button with picker */}
        <div
          className="relative"
          onMouseEnter={handlePickerEnter}
          onMouseLeave={handlePickerLeave}
        >
          {/* Floating emoji picker */}
          {showPicker && (
            <div className="absolute bottom-full mb-2 left-0 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-2 py-1.5 shadow-dropdown animate-scale-in z-30 whitespace-nowrap">
              {REACTIONS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  onClick={() => triggerLike(emoji)}
                  title={label}
                  className="text-xl hover:scale-125 transition-transform duration-150 px-0.5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => triggerLike()}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              isLiked
                ? `${activeReactionColor || "text-red-500 bg-red-50 dark:bg-red-900/20"}`
                : "text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            } ${likeAnim ? "animate-like-pop" : ""}`}
          >
            <span
              className={`text-[17px] leading-none ${!isLiked ? "grayscale opacity-60" : ""}`}
            >
              {isLiked ? myReaction || "❤️" : "🤍"}
            </span>
            <span>{post.likes?.length || 0}</span>
          </button>
        </div>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
            showComments
              ? "text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400"
              : "text-gray-500 dark:text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
          }`}
        >
          <MessageCircle size={17} strokeWidth={2} />
          <span>{post.comments?.length || 0}</span>
        </button>

        <div className="flex-1" />

        {/* Share */}
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          title="Copy link"
        >
          <Share2 size={16} />
        </button>

        {/* Bookmark */}
        <button
          onClick={() => setBookmarked((b) => !b)}
          className={`p-2 rounded-xl transition-colors ${
            bookmarked
              ? "text-brand-500 bg-brand-50 dark:bg-brand-900/20"
              : "text-gray-400 dark:text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
          }`}
          title={bookmarked ? "Bookmarked" : "Bookmark"}
        >
          <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 space-y-2.5 animate-fade-in">
          {post.comments?.map((c) => {
            const cs = commentSentiments[c._id];
            return (
              <div
                key={c._id}
                className="flex items-start gap-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3"
              >
                <div className="avatar w-7 h-7 text-xs flex-shrink-0">
                  {(c.user?.name || c.name)?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {c.user?.name || c.name}
                      </span>
                      {cs && (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium
                          ${
                            cs.color === "green"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : cs.color === "red"
                                ? "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
                                : cs.color === "yellow"
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {cs.emoji} {cs.mood}
                        </span>
                      )}
                    </div>
                    {c.user?._id === user?._id && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
                    {renderText(c.text)}
                  </p>
                </div>
              </div>
            );
          })}

          <form onSubmit={handleComment} className="flex gap-2 pt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field py-2 text-sm"
              placeholder="Write a comment… use #tags or @mentions"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={loading || !commentText.trim()}
              className="btn-primary p-2.5 flex-shrink-0"
            >
              {loading ? (
                <span className="spinner w-4 h-4" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
