import { useState, useRef, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Send, Image as ImageIcon, X, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSentiment } from "../helper/huggingFaceSentiment";

const MOOD_GRADIENT = {
  green: "from-emerald-400 to-emerald-500",
  red: "from-red-400 to-red-500",
  yellow: "from-amber-400 to-amber-500",
  gray: "from-gray-300 to-gray-400",
};

const MOOD_BG = {
  green: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400",
  red: "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400",
  yellow: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400",
  gray: "bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400",
};

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { user } = useAuth();
  const fileInputRef = useRef();
  const debounceRef = useRef(null);

  // ── debounced live sentiment ──────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim() || text.trim().length < 4) {
      setSentiment(null);
      setAnalyzing(false);
      return;
    }

    setAnalyzing(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getSentiment(text.trim());
        setSentiment(res);
      } catch {
        setSentiment(null);
      } finally {
        setAnalyzing(false);
      }
    }, 900);

    return () => clearTimeout(debounceRef.current);
  }, [text]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    fileInputRef.current.value = null;
  };

  // ── AI Caption Generator ──────────────────────────────────────────────────
  const generateCaption = async () => {
    setGenerating(true);
    try {
      const { data } = await axiosInstance.post("/api/v1/assistant/chat", {
        message:
          "Generate one creative, authentic social media post caption. Keep it 1-2 sentences, positive and engaging. Reply with just the caption text only — no quotes, no formatting, no explanation.",
      });
      const reply = typeof data.reply === "string" ? data.reply : "";
      if (reply) setText(reply.replace(/^["']|["']$/g, "").trim());
    } catch (err) {
      console.error("Caption generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (image) formData.append("image", image);
      const res = await axiosInstance.post("/api/v1/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPostCreated(res.data.data);
      setText("");
      removeImage();
      setSentiment(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const charPercent = (text.length / 500) * 100;
  const charColor =
    charPercent > 90
      ? "text-red-500"
      : charPercent > 70
        ? "text-amber-500"
        : "text-gray-400";
  const pct = sentiment ? Math.round((sentiment.confidence || 0) * 100) : 0;
  const gradient = sentiment
    ? MOOD_GRADIENT[sentiment.color] || MOOD_GRADIENT.gray
    : "";
  const moodBg = sentiment ? MOOD_BG[sentiment.color] || MOOD_BG.gray : "";

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="avatar w-10 h-10 text-sm mt-0.5 flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind? Use #hashtags or @mentions…"
            className="w-full px-0 py-1 bg-transparent border-none outline-none resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-[15px] leading-relaxed"
            rows="3"
            maxLength={500}
          />

          {/* ── Mood meter ─────────────────────────────────────────────────── */}
          {text.trim().length >= 4 && (
            <div className="mb-3 space-y-2">
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {analyzing ? (
                  <div className="h-full w-1/3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                ) : sentiment ? (
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                ) : null}
              </div>

              {analyzing ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <span>Detecting mood…</span>
                </div>
              ) : sentiment ? (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${moodBg}`}
                >
                  <span className="text-base leading-none">{sentiment.emoji}</span>
                  <span className="font-semibold">{sentiment.mood}</span>
                  <span className="opacity-60">· {pct}%</span>
                  {sentiment.suggestion && (
                    <span className="hidden sm:inline opacity-70 border-l border-current/20 pl-2">
                      {sentiment.suggestion}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Image preview */}
          {preview && (
            <div className="relative mt-2 mb-3 inline-block">
              <img
                src={preview}
                className="rounded-xl border border-gray-100 dark:border-gray-700 max-h-48 object-cover shadow-sm"
                alt="preview"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-700 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

          <div className="divider mb-3" />

          <div className="flex items-center justify-between gap-2">
            {/* Left tools */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20"
              >
                <ImageIcon size={17} />
                <span className="hidden sm:inline">Photo</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </button>

              {/* AI Caption Generator */}
              <button
                type="button"
                onClick={generateCaption}
                disabled={generating}
                className="flex items-center gap-1.5 text-sm font-medium text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-50"
                title="Generate AI caption"
              >
                {generating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                <span className="hidden sm:inline">
                  {generating ? "Writing…" : "AI Caption"}
                </span>
              </button>
            </div>

            {/* Right: char count + post button */}
            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <span className={`text-xs font-medium tabular-nums ${charColor}`}>
                  {text.length}/500
                </span>
              )}
              <button
                type="submit"
                disabled={loading || (!text.trim() && !image)}
                className="btn-primary px-5"
              >
                {loading ? (
                  <span className="spinner w-4 h-4" />
                ) : (
                  <>
                    <Send size={15} /> Post
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
