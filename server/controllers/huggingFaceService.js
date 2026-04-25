const axios = require('axios');

const HF_API_KEY = process.env.HF_API_KEY || "hf_XXXXXXXXXXXXXXXXXXXX";

// Router URL (HF Inference API)
const HF_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english";

/**
 * Neutral acknowledgement words
 * These SHOULD NOT be treated as positive even if score is 0.99+
 */
const NEUTRAL_ACK_WORDS = [
  'ok',
  'okay',
  'okayy',
  'fine',
  'sure',
  'hmm',
  'hm',
  'alright',
  'k',
  'kk',
  'yes',
  'yeah',
  'normal',
  'average',
  'so-so',
  'yep',
  '👍',
  '👌',
];

/**
 * Detect short neutral acknowledgements like:
 * "ok", "okay", "fine", "sure"
 */
function isNeutralAcknowledgement(text) {
  if (!text) return false;

  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '');

  const words = cleaned.split(' ').filter(Boolean);

  // Single or two-word acknowledgements
  if (words.length <= 2) {
    return NEUTRAL_ACK_WORDS.includes(cleaned);
  }

  return false;
}

async function getSentimentFromHF(text) {
  if (!HF_API_KEY) {
    throw new Error('HF_API_KEY is not set');
  }

  const response = await axios.post(
    HF_MODEL_URL,
    { inputs: text },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  let outputs = response.data;

  // Handle HF response formats
  if (Array.isArray(outputs) && Array.isArray(outputs[0])) {
    outputs = outputs[0];
  }

  if (!Array.isArray(outputs) || outputs.length === 0) {
    return null;
  }

  const positive = outputs.find(o => o.label === 'POSITIVE');
  const negative = outputs.find(o => o.label === 'NEGATIVE');

  const positiveScore = positive?.score || 0;
  const negativeScore = negative?.score || 0;

  let finalLabel = 'NEGATIVE';

  /**
   * 🔴 PRIORITY 1: Hard override for acknowledgements
   * Example: "ok", "okay", "fine"
   */
  if (isNeutralAcknowledgement(text)) {
    finalLabel = 'NEUTRAL';
  }
  /**
   * 🟡 PRIORITY 2: Confidence-based sentiment
   */
  else if (positiveScore >= 0.9) {
    finalLabel = 'POSITIVE';
  } else if (positiveScore >= 0.7) {
    finalLabel = 'NEUTRAL';
  } else {
    finalLabel = 'NEGATIVE';
  }

  return {
    label: finalLabel,
    score: positiveScore,
    raw: {
      positive: positiveScore,
      negative: negativeScore,
    },
  };
}

module.exports = {
  getSentimentFromHF,
};
