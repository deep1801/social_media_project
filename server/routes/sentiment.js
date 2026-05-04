const express = require("express");
const { getSentimentFromHF } = require("../controllers/huggingFaceService");
const router = express.Router();

// ── In-memory cache: text → result (max 500 entries, TTL 10 min) ─────────────
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE = 500;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  if (cache.size >= MAX_CACHE) {
    // evict oldest
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, ts: Date.now() });
}

// ── Simple per-IP rate limit: max 30 req / minute ────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW = 60 * 1000;
const RATE_MAX = 30;

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - record.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  record.count++;
  rateLimitMap.set(ip, record);
  return record.count > RATE_MAX;
}

// ── POST /api/v1/sentiment ────────────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const text = req.body?.text;

    // Validate
    if (!text || typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Text is required" });
    }

    const trimmed = text.trim();

    // Too short — return neutral immediately, no API call
    if (trimmed.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          label: "NEUTRAL",
          mood: "Neutral",
          emoji: "😐",
          color: "gray",
          score: 0.5,
          confidence: 0.5,
        },
        cached: false,
      });
    }

    // Rate limit
    if (isRateLimited(ip)) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please slow down.",
      });
    }

    // Cache hit
    const cacheKey = trimmed.toLowerCase().slice(0, 300);
    const cached = getCached(cacheKey);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, data: cached, cached: true });
    }

    // Call HuggingFace
    const sentiment = await getSentimentFromHF(trimmed);

    if (!sentiment) {
      return res.status(200).json({
        success: true,
        data: {
          label: "NEUTRAL",
          mood: "Neutral",
          emoji: "😐",
          color: "gray",
          score: 0.5,
          confidence: 0.5,
        },
        cached: false,
      });
    }

    setCache(cacheKey, sentiment);

    return res
      .status(200)
      .json({ success: true, data: sentiment, cached: false });
  } catch (error) {
    console.error(
      "Sentiment API error:",
      error?.response?.data || error.message,
    );

    // HF model loading
    if (error?.response?.status === 503) {
      return res.status(200).json({
        success: true,
        data: {
          label: "NEUTRAL",
          mood: "Neutral",
          emoji: "😐",
          color: "gray",
          score: 0.5,
          confidence: 0.5,
        },
        cached: false,
      });
    }

    return next(error);
  }
});

module.exports = router;
