// routes/sentiment.js
const express = require('express');
const { getSentimentFromHF } = require('../controllers/huggingFaceService');
const router = express.Router();




router.post('/', async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a string',
      });
    }

    const sentiment = await getSentimentFromHF(text);

    return res.status(200).json({
      success: true,
      data: sentiment,
    });
  } catch (error) {
    console.error('Error in /api/v1/sentiment:', error?.response?.data || error.message);
    // Pass to your global error handler
    return next(error);
  }
});

module.exports = router;
