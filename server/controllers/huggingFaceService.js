const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY || "";
const HF_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english";

// ── Neutral acknowledgement words ─────────────────────────────────────────────
const NEUTRAL_WORDS = new Set([
  "ok",
  "okay",
  "okayy",
  "fine",
  "sure",
  "hmm",
  "hm",
  "alright",
  "k",
  "kk",
  "yes",
  "yeah",
  "yep",
  "nope",
  "no",
  "maybe",
  "idk",
  "normal",
  "average",
  "so-so",
  "meh",
  "whatever",
  "noted",
]);

// ── Positive emoji signals ────────────────────────────────────────────────────
const POSITIVE_EMOJIS = [
  "😊",
  "😄",
  "😁",
  "🥰",
  "❤️",
  "💕",
  "🎉",
  "🙌",
  "👏",
  "✨",
  "🔥",
  "💯",
  "😍",
  "🤩",
  "😂",
  "🥳",
];
const NEGATIVE_EMOJIS = [
  "😢",
  "😭",
  "😡",
  "🤬",
  "💔",
  "😤",
  "😠",
  "😞",
  "😔",
  "😟",
  "🙁",
  "😣",
  "😖",
  "😩",
  "😫",
];

function countEmojiSignals(text) {
  let pos = 0,
    neg = 0;
  POSITIVE_EMOJIS.forEach((e) => {
    if (text.includes(e)) pos++;
  });
  NEGATIVE_EMOJIS.forEach((e) => {
    if (text.includes(e)) neg++;
  });
  return { pos, neg };
}

// ── Sarcasm hint detection (basic) ───────────────────────────────────────────
const SARCASM_PATTERNS = [
  /yeah right/i,
  /oh great/i,
  /wow thanks/i,
  /sure sure/i,
  /totally fine/i,
  /oh wonderful/i,
  /just perfect/i,
  /how lovely/i,
  /oh really/i,
  /as if/i,
];

function hasSarcasmHint(text) {
  return SARCASM_PATTERNS.some((p) => p.test(text));
}

function isNeutralAck(text) {
  if (!text) return false;
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");
  const words = cleaned.split(" ").filter(Boolean);
  return words.length <= 2 && NEUTRAL_WORDS.has(cleaned);
}

// ── Rich label mapping ────────────────────────────────────────────────────────
function mapToRichLabel(positiveScore, negativeScore, text) {
  const emojiSignals = countEmojiSignals(text);
  const sarcasm = hasSarcasmHint(text);

  // Sarcasm override — flip positive to mixed/negative
  if (sarcasm && positiveScore > 0.6) {
    return {
      label: "NEGATIVE",
      mood: "Sarcastic",
      emoji: "🙄",
      color: "yellow",
      description: "This text may contain sarcasm or irony.",
      suggestion:
        "Read carefully — the tone might be the opposite of the words.",
    };
  }

  if (isNeutralAck(text)) {
    return {
      label: "NEUTRAL",
      mood: "Neutral",
      emoji: "😐",
      color: "gray",
      description: "A neutral acknowledgement.",
      suggestion: "No strong emotion detected.",
    };
  }

  // Emoji boost: if text has strong emoji signals, adjust
  let adjPositive = positiveScore + emojiSignals.pos * 0.05;
  let adjNegative = negativeScore + emojiSignals.neg * 0.05;
  adjPositive = Math.min(adjPositive, 1);
  adjNegative = Math.min(adjNegative, 1);

  if (adjPositive >= 0.95) {
    return {
      label: "POSITIVE",
      mood: "Joyful",
      emoji: "🤩",
      color: "green",
      description: "Extremely positive and enthusiastic!",
      suggestion: "Great energy — keep spreading the positivity!",
    };
  }
  if (adjPositive >= 0.82) {
    return {
      label: "POSITIVE",
      mood: "Happy",
      emoji: "😊",
      color: "green",
      description: "This post has a happy, uplifting tone.",
      suggestion: "Engage warmly and encourage further positivity.",
    };
  }
  if (adjPositive >= 0.65) {
    return {
      label: "POSITIVE",
      mood: "Optimistic",
      emoji: "🙂",
      color: "green",
      description: "Mildly positive with an optimistic tone.",
      suggestion: "A friendly reply would work well here.",
    };
  }
  if (adjNegative < 0.6 && adjPositive < 0.65) {
    return {
      label: "NEUTRAL",
      mood: "Neutral",
      emoji: "😐",
      color: "gray",
      description: "Balanced or informational tone.",
      suggestion: "Keep your response clear and professional.",
    };
  }
  if (adjNegative >= 0.6 && adjNegative < 0.78) {
    return {
      label: "NEUTRAL",
      mood: "Concerned",
      emoji: "😕",
      color: "yellow",
      description: "Slightly negative or uncertain tone.",
      suggestion: "Respond with empathy and understanding.",
    };
  }
  if (adjNegative >= 0.78 && adjNegative < 0.93) {
    return {
      label: "NEGATIVE",
      mood: "Sad",
      emoji: "😢",
      color: "red",
      description: "This post expresses sadness or disappointment.",
      suggestion: "Offer support and respond with compassion.",
    };
  }
  if (adjNegative >= 0.93) {
    return {
      label: "NEGATIVE",
      mood: "Angry",
      emoji: "😡",
      color: "red",
      description: "Strong negative emotion — frustration or anger.",
      suggestion: "Stay calm, acknowledge feelings, and de-escalate.",
    };
  }

  return {
    label: "NEUTRAL",
    mood: "Neutral",
    emoji: "😐",
    color: "gray",
    description: "No strong sentiment detected.",
    suggestion: "Keep your response balanced.",
  };
}

// ── Main export ───────────────────────────────────────────────────────────────
async function getSentimentFromHF(text) {
  if (!text || typeof text !== "string" || !text.trim()) return null;
  if (!HF_API_KEY) throw new Error("HF_API_KEY is not set");

  const response = await axios.post(
    HF_MODEL_URL,
    { inputs: text.trim().slice(0, 512) }, // model max tokens
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 12000,
    },
  );

  let outputs = response.data;
  if (Array.isArray(outputs) && Array.isArray(outputs[0])) outputs = outputs[0];
  if (!Array.isArray(outputs) || outputs.length === 0) return null;

  const positive = outputs.find((o) => o.label === "POSITIVE");
  const negative = outputs.find((o) => o.label === "NEGATIVE");
  const positiveScore = positive?.score || 0;
  const negativeScore = negative?.score || 0;

  const rich = mapToRichLabel(positiveScore, negativeScore, text);

  return {
    label: rich.label,
    mood: rich.mood,
    emoji: rich.emoji,
    color: rich.color,
    description: rich.description,
    suggestion: rich.suggestion,
    score: positiveScore,
    confidence: Math.max(positiveScore, negativeScore),
    raw: { positive: positiveScore, negative: negativeScore },
  };
}

module.exports = { getSentimentFromHF };
