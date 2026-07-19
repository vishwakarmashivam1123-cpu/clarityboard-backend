const express = require('express');
const router = express.Router();
const Class = require('../models/class');

// Generate a random 6-digit code
function generateClassCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/classes  → create a new class
router.post('/', async (req, res) => {
  try {
    const { subject, teacherName, teacherEmail } = req.body;

    if (!subject || !teacherName || !teacherEmail) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const classCode = generateClassCode();

    const newClass = new Class({
      classCode,
      subject,
      teacherName,
      teacherEmail
    });

    await newClass.save();

    res.status(201).json(newClass);
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ error: "Something went wrong creating the class.", details: err.message });
  }
});
router.post('/get-or-create', async (req, res) => {
  try {
    const { teacherName, teacherEmail } = req.body;

    if (!teacherName || !teacherEmail) {
      return res.status(400).json({ error: "Teacher info is required." });
    }

    let existingClass = await Class.findOne({ teacherEmail });

    if (existingClass) {
      return res.json(existingClass);
    }

    const classCode = generateClassCode();
    const newClass = new Class({
      classCode,
      subject: "General",
      teacherName,
      teacherEmail
    });

    await newClass.save();
    res.status(201).json(newClass);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});
// GET /api/classes/teacher/:email  → get all classes created by this teacher
router.get('/teacher/:email', async (req, res) => {
  try {
    const classes = await Class.find({ teacherEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching classes." });
  }
});

// GET /api/classes/:code  → check if a class code is valid (used when student joins)
router.get('/:code', async (req, res) => {
  try {
    const foundClass = await Class.findOne({ classCode: req.params.code });

    if (!foundClass) {
      return res.status(404).json({ error: "Class not found." });
    }

    res.json(foundClass);
} catch (err) {
    console.error("Error finding class:", err);
    res.status(500).json({ error: "Something went wrong creating the class.", details: err.message });
  }
});

module.exports = router;