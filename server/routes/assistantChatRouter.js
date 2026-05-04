const express = require("express");
const axios = require("axios");
const router = express.Router();

const HF_API_KEY = process.env.HF_API_KEY;

// Using a conversational / text-generation model available on HF Inference API
const HF_CHAT_URL =
  "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions";

const SYSTEM_PROMPT = `You are a helpful AI assistant for SocialApp, a social media platform.
You help users with questions about using the app, posting content, messaging, following people, and general support.
Keep your answers concise, friendly, and helpful. Do not answer questions unrelated to the social media app or general help.`;

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if (!HF_API_KEY) {
    console.error("HF_API_KEY is not set in .env");
    return res.status(500).json({ reply: "AI service is not configured." });
  }

  try {
    const response = await axios.post(
      HF_CHAT_URL,
      {
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message.trim() },
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    const reply =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response. Please try again.";

    return res.json({ reply });
  } catch (err) {
    console.error("AI assistant error:", err?.response?.data || err.message);

    // HF model loading (503) — tell user to retry
    if (err?.response?.status === 503) {
      return res.status(503).json({
        reply: "The AI model is loading, please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      reply:
        "Sorry, I'm having trouble responding right now. Please try again shortly.",
    });
  }
});

module.exports = router;
