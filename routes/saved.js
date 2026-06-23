const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET — fetch user's saved articles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedArticles');
    res.json({ savedArticles: user.savedArticles || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST — save an article
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { article } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { savedArticles: article }
    });
    res.json({ message: 'Article saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE — remove an article
router.delete('/remove', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { savedArticles: { url } }
    });
    res.json({ message: 'Article removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;