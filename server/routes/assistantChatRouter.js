const express = require("express");
const axios = require("axios");

const assistantChatRouter = express.Router();

/**
 * COMPANY CONTEXT – SocialApp (College Project)
 */
const COMPANY_CONTEXT = `
SYSTEM ROLE:
You are the official AI assistant of SocialApp.

SCOPE:
You must respond only to questions related to the SocialApp project.
If a question is unrelated, reply exactly with:
I can only help with information related to the SocialApp project.

ABOUT SocialApp:
SocialApp is a social media application developed as a student academic project.

ACADEMIC DETAILS:
This project is developed by MCA students of Quantum University, Roorkee.
It is a 3rd semester project.

PROJECT OWNERSHIP:
The project is developed by Pradeep Kumar Yadav and his team.

FACULTY GUIDANCE:
This project is developed under the guidance of Raj Kumar Sir,
respected Database Management Lab (DBML) faculty.
The DBML subject includes concepts of database management,
data visualization, and machine learning fundamentals.

PROJECT OVERVIEW:
SocialApp is a basic social media platform where users can:
Sign up and log in using email ID and password.
Create and manage user profiles.
Create posts and share content.
Like and comment on posts.
Send and manage follow requests.
Follow other users.
Chat with other users.
View activity feeds.

AI USAGE:
The project uses AI concepts to analyze posts and comments
for basic sentiment and engagement understanding.

RESPONSE GUIDELINES:
Always answer in the context of the SocialApp project.
Use simple, clear, and attractive language suitable for an academic project.
Do not mention APIs, backend routes, or database tables.
Do not invent features outside this project scope.
Maintain a polite, professional, and helpful tone.
`;



/**
 * POST /
 * AI chat restricted to SocialApp context
 */
assistantChatRouter.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const HF_TOKEN = process.env.HF_API_KEY1;
    if (!HF_TOKEN) {
      return res.status(500).json({ error: "HF API key missing" });
    }

    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "deepseek-ai/DeepSeek-V3:fastest",
        messages: [
          { role: "system", content: COMPANY_CONTEXT },
          { role: "user", content: message }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "I could not generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("AI Chat Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI request failed" });
  }
});

module.exports = assistantChatRouter;
