import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  Heart,
  MessageCircle,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSentiment } from "../helper/huggingFaceSentiment";

const BASE_URL = "https://social-media-project-si7w.onrender.com";

const COLOR = {
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    bar: "bg-emerald-400",
    light: "bg-emerald-100",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    bar: "bg-red-400",
    light: "bg-red-100",
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    bar: "bg-amber-400",
    light: "bg-amber-100",
  },
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
    bar: "bg-gray-300",
    light: "bg-gray-100",
  },
};

// ── Sentiment Panel ───────────────────────────────────────────────────────────
const SentimentPanel = ({ sentiment, loading }) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 mb-3 animate-pulse">
        <div className="w-6 h-6 rounded-full bg-gray-200" />
        <div className="w-24 h-3 rounded bg-gray-200" />
        <div className="w-16 h-3 rounded bg-gray-100" />
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
      {/* Main row — always visible */}
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
          {/* Confidence bar */}
          <div className="mt-1 w-full h-1.5 rounded-full bg-white/60 overflow-hidden">
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

      {/* Expanded details */}
      {expanded && (
        <div className={`px-3 pb-3 border-t ${c.border} pt-2.5 space-y-2`}>
          {sentiment.description && (
            <p className="text-xs text-gray-600 leading-relaxed">
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
          {/* Raw scores */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">Positive</span>
              <div className="w-16 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{
                    width: `${Math.round((sentiment.raw?.positive || 0) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500">
                {Math.round((sentiment.raw?.positive || 0) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">Negative</span>
              <div className="w-16 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full"
                  style={{
                    width: `${Math.round((sentiment.raw?.negative || 0) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500">
                {Math.round((sentiment.raw?.negative || 0) * 100)}%
              </span>
            </div>
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

  // comment sentiments cache: { [commentId]: result }
  const [commentSentiments, setCommentSentiments] = useState({});

  const isLiked = post.likes?.some((like) => like.user === user?._id);
  const isOwner = post.user?._id === user?._id;

  // ── auto-analyse post text on mount ──────────────────────────────────────
  useEffect(() => {
    if (!post.text?.trim()) return;
    setSentimentLoad(true);
    getSentiment(post.text)
      .then((res) => setSentiment(res))
      .catch(() => setSentiment(null))
      .finally(() => setSentimentLoad(false));
  }, [post._id]);

  // ── analyse comments when section opens ──────────────────────────────────
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

  const handleLike = async () => {
    try {
      const endpoint = isLiked ? "unlike" : "like";
      const res = await axiosInstance.put(
        `/api/v1/posts/${post._id}/${endpoint}`,
      );
      onUpdate(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    }
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
        { text: commentText },
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
          <div className="avatar w-9 h-9 text-sm">
            {post.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {post.user?.name}
            </p>
            <p className="text-[11px] text-gray-400">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="btn-danger p-1.5 rounded-xl"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Text */}
      {post.text && (
        <p className="text-gray-800 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
          {post.text}
        </p>
      )}

      {/* Sentiment panel */}
      <SentimentPanel sentiment={sentiment} loading={sentimentLoad} />

      {/* Image */}
      {post.image && (
        <img
          src={
            post.image.startsWith("http")
              ? post.image
              : `${BASE_URL}${post.image}`
          }
          className="rounded-xl mb-3 w-full max-h-96 object-cover border border-gray-100"
          alt="post"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
        >
          <Heart
            size={18}
            fill={isLiked ? "currentColor" : "none"}
            strokeWidth={2}
          />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors"
        >
          <MessageCircle size={18} strokeWidth={2} />
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
          {post.comments?.map((c) => {
            const cs = commentSentiments[c._id];
            return (
              <div
                key={c._id}
                className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3"
              >
                <div className="avatar w-7 h-7 text-xs flex-shrink-0">
                  {(c.user?.name || c.name)?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {c.user?.name || c.name}
                      </span>
                      {/* inline comment sentiment badge */}
                      {cs && (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium
                          ${
                            cs.color === "green"
                              ? "bg-emerald-50 text-emerald-600"
                              : cs.color === "red"
                                ? "bg-red-50 text-red-500"
                                : cs.color === "yellow"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {cs.emoji} {cs.mood}
                        </span>
                      )}
                    </div>
                    {c.user?._id === user?._id && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
                </div>
              </div>
            );
          })}

          <form onSubmit={handleComment} className="flex gap-2 pt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field py-2 text-sm"
              placeholder="Write a comment…"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={loading || !commentText.trim()}
              className="btn-primary p-2.5 flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
