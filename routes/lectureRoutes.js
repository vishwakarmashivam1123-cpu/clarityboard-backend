const express = require('express');
const router = express.Router();
const Lecture = require('../models/lecture');

// POST /api/lectures  → create a new lecture (teacher starts a session)
router.post('/', async (req, res) => {
  try {
    const { classCode, topics } = req.body;

    if (!classCode || !topics || topics.length === 0) {
      return res.status(400).json({ error: "Class code and at least one topic are required." });
    }

    const newLecture = new Lecture({
      classCode,
      topics
    });

    await newLecture.save();

    res.status(201).json(newLecture);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating the lecture." });
  }
});

// GET /api/lectures/class/:classCode  → get all lecture sessions under this class
router.get('/class/:classCode', async (req, res) => {
  try {
    const lectures = await Lecture.find({ classCode: req.params.classCode }).sort({ lectureDate: -1 });
    res.json(lectures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching lectures." });
  }
});

// GET /api/lectures/latest/:classCode  → get the most recent lecture for a class
router.get('/latest/:classCode', async (req, res) => {
  try {
    const lecture = await Lecture.findOne({ classCode: req.params.classCode })
      .sort({ lectureDate: -1 });

    if (!lecture) {
      return res.status(404).json({ error: "No lecture found for this class." });
    }

    // Check the 24-hour submission window
    const now = new Date();
    const hoursSinceLecture = (now - lecture.lectureDate) / (1000 * 60 * 60);

    if (hoursSinceLecture > 24) {
      return res.status(403).json({ error: "Submission window has closed for this lecture." });
    }

    res.json(lecture);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;