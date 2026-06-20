const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// POST /api/history/read  — called when user clicks Read More
router.post('/read', authMiddleware, async (req, res) => {
  try {
    const { title, description, url, urlToImage, publishedAt, source, category } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        readHistory: {
          $each: [{ title, description, url, urlToImage, publishedAt, source, category, readAt: new Date() }],
          $slice: -50  // keep only last 50 articles
        }
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/history  — FastAPI calls this to get user's history
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('readHistory savedArticles');
    res.json({
      readHistory: user.readHistory || [],
      savedArticles: user.savedArticles || []
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;