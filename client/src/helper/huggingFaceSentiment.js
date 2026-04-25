// src/utils/huggingFaceSentiment.js
import axiosInstance from "../api/axiosInstance";

export async function getSentiment(text) {
  try {
    const res = await axiosInstance.post("/api/v1/sentiment", { text });
    if (!res.data?.success) return null;
    return res.data.data; // { label, score }
  } catch (error) {
    console.error("Error calling backend sentiment API:", error);
    return null;
  }
}
