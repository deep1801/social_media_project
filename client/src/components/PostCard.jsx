import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Heart, MessageCircle, Trash2, Send, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSentiment } from "../helper/huggingFaceSentiment";

const PostCard = ({ post, onDelete, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // NEW: analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [postSentiment, setPostSentiment] = useState(null); // { label, score }
  const [commentsSentimentSummary, setCommentsSentimentSummary] =
    useState(null); // { positive, negative, neutral, total }
  const [analysisError, setAnalysisError] = useState(null);

  const isLiked = post.likes?.some((like) => like.user === user?._id);
  const isOwner = post.user?._id === user?._id;

  const handleLike = async () => {
    try {
      const endpoint = isLiked ? "unlike" : "like";
      const res = await axiosInstance.put(
        `/api/v1/posts/${post._id}/${endpoint}`,
      );
      onUpdate(res.data.data);
    } catch (err) {
      console.error("Failed to like/unlike post:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axiosInstance.delete(`/api/v1/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post");
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
      onUpdate(res.data.data);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axiosInstance.delete(
        `/api/v1/posts/${post._id}/comments/${commentId}`,
      );
      onUpdate(res.data.data);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // ---------- NEW: Analysis logic ----------
  const analyzePostAndComments = async () => {
    setAnalysisError(null);
    setAnalyzing(true);
    setPostSentiment(null);
    setCommentsSentimentSummary(null);

    try {
      // 1) analyze post text
      if (post.text && post.text.trim()) {
        const pSent = await getSentiment(post.text);
        setPostSentiment(pSent || null);
      }

      // 2) analyze comments (if any) in parallel and summarize
      const comments = post.comments || [];
      if (comments.length > 0) {
        const promises = comments.map((c) => {
          const text = (c.text || "").trim();
          // skip empty comments
          if (!text) return Promise.resolve(null);
          return getSentiment(text).catch(() => null);
        });

        const results = await Promise.all(promises);
        // compute summary
        const summary = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0, total: 0 };
        results.forEach((r) => {
          if (!r || !r.label) return;
          const lbl = r.label.toUpperCase();
          if (lbl === "POSITIVE") summary.POSITIVE += 1;
          else if (lbl === "NEGATIVE") summary.NEGATIVE += 1;
          else summary.NEUTRAL += 1;
          summary.total += 1;
        });

        setCommentsSentimentSummary(summary);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisError("Analysis failed. Try again later.");
    } finally {
      setAnalyzing(false);
    }
  };

  // helper for friendly badge UI
  const SentimentBadge = ({ sentiment }) => {
    if (!sentiment) return null;
    const { label, score } = sentiment;
    const percent = (score * 100).toFixed(1);
    let emoji = "😐";
    let bg = "bg-gray-100 text-gray-700";
    if (label === "POSITIVE") {
      emoji = "😊";
      bg = "bg-green-100 text-green-800";
    } else if (label === "NEGATIVE") {
      emoji = "😡";
      bg = "bg-red-100 text-red-800";
    }
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}
      >
        <span className="mr-1">{emoji}</span>
        <span className="font-medium mr-1">{label}</span>
        <span className="text-[11px] text-gray-600">{percent}%</span>
      </span>
    );
  };

  const renderCommentsSummary = () => {
    if (!commentsSentimentSummary) return null;
    const s = commentsSentimentSummary;
    if (!s.total)
      return <p className="text-sm text-gray-500">No analyzed comments</p>;

    const posPct = Math.round((s.POSITIVE / s.total) * 100);
    const negPct = Math.round((s.NEGATIVE / s.total) * 100);
    const neuPct = Math.round((s.NEUTRAL / s.total) * 100);

    return (
      <div className="mt-2 text-xs text-gray-600">
        Comments analyzed: {s.total} — Positive: {posPct}% • Negative: {negPct}%
        • Neutral: {neuPct}%
      </div>
    );
  };

  const suggestedAction = () => {
    if (!postSentiment && !commentsSentimentSummary) return "";
    // prioritize post sentiment
    if (postSentiment) {
      if (postSentiment.label === "NEGATIVE" && postSentiment.score > 0.75) {
        return "This post seems negative — consider responding empathetically or offering help/support.";
      }
      if (postSentiment.label === "POSITIVE" && postSentiment.score > 0.6) {
        return "This post seems positive — engage with a friendly reply and encouragement.";
      }
    }
    // fallback to comments summary
    if (commentsSentimentSummary && commentsSentimentSummary.total > 0) {
      const { POSITIVE, NEGATIVE } = commentsSentimentSummary;
      if (NEGATIVE > POSITIVE) {
        return "Comments trend negative — consider clarifying, apologizing if needed, and addressing concerns.";
      } else if (POSITIVE > NEGATIVE) {
        return "Comments trend positive — thank users and encourage further engagement.";
      }
    }
    return "Mixed/neutral sentiment — keep response balanced and professional.";
  };

  // ---------- UI ----------
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {post.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.user?.name || "Unknown User"}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Delete post"
            >
              <Trash2 size={18} />
            </button>
          )}

          {/* ANALYZE BUTTON */}
          <button
            onClick={analyzePostAndComments}
            disabled={analyzing}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Analyze post sentiment"
          >
            <Activity size={14} />
            <span>{analyzing ? "Analyzing..." : "Analyze"}</span>
          </button>
        </div>
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.text}</p>

      {post.image && (
        <img
          src={`http://localhost:5004${post.image}`}
          alt="Post"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      {/* Analysis panel */}
      {postSentiment || commentsSentimentSummary || analysisError ? (
        <div className="mb-4 p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-sm">Analysis</h4>
              {postSentiment && <SentimentBadge sentiment={postSentiment} />}
            </div>
            <div className="text-xs text-gray-500">
              {postSentiment
                ? `Confidence ${(postSentiment.score * 100).toFixed(1)}%`
                : ""}
            </div>
          </div>

          {analysisError && (
            <p className="text-red-500 text-sm mt-2">{analysisError}</p>
          )}

          {renderCommentsSummary()}

          <div className="mt-3 text-sm text-gray-700">
            <strong>Suggested action:</strong> {suggestedAction()}
          </div>
        </div>
      ) : null}

      <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
          }`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span className="text-sm font-medium">{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">
            {post.comments?.length || 0}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <form
            onSubmit={handleComment}
            className="flex items-center space-x-2 mb-4"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={loading || !commentText.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="space-y-3">
            {post.comments?.map((comment) => (
              <div
                key={comment._id}
                className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {comment.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900">
                      {comment.name}
                    </h4>
                    {comment?.user?._id === user?._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
