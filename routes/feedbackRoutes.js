const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Filter = require('bad-words');

const filter = new Filter();
// Add your own Hindi/Marathi words to the filter
filter.addWords('badword1', 'badword2'); // replace with actual words you want blocked

// In-memory strike tracker (simple version — resets if server restarts)
// Key = session cookie value, Value = strike count
const strikes = {};

// POST /api/feedback  → student submits feedback
router.post('/', async (req, res) => {
  try {
    const { classCode, lectureId, topicRatings, doubt, lectureRating, suggestion } = req.body;

    if (!classCode || !lectureId || !lectureRating) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Get or create a session ID from cookies
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      res.cookie('sessionId', sessionId, { maxAge: 24 * 60 * 60 * 1000 });
    }

    // Check strikes for this session
    if (strikes[sessionId] >= 3) {
      return res.status(403).json({ error: "You have been blocked for this session due to repeated inappropriate content." });
    }

    // Check doubt/suggestion text for bad words
    const combinedText = `${doubt || ""} ${suggestion || ""}`;
    if (filter.isProfane(combinedText)) {
      strikes[sessionId] = (strikes[sessionId] || 0) + 1;
      return res.status(400).json({
        error: `Inappropriate content detected. Strike ${strikes[sessionId]}/3.`
      });
    }

    const newFeedback = new Feedback({
      classCode,
      lectureId,
      topicRatings,
      doubt: doubt || "",
      lectureRating,
      suggestion: suggestion || ""
    });

    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong submitting feedback." });
  }
});

// GET /api/feedback/:lectureId  → get all feedback for a lecture (teacher dashboard)
router.get('/:lectureId', async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ lectureId: req.params.lectureId });
    res.json(feedbackList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PATCH /api/feedback/:id/resolve  → mark a doubt as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ error: "Feedback not found." });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;