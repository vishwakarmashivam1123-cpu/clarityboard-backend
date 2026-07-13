const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Teacher = require('../models/teacher');

// POST /api/teachers/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Hash the password before saving — 10 is the "salt rounds" (higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teacher({
      name,
      email,
      password: hashedPassword
    });

    await newTeacher.save();

    res.status(201).json({ message: "Registration successful! Please login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong during registration." });
  }
});

// POST /api/teachers/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare the typed password against the stored hash
    const passwordMatch = await bcrypt.compare(password, teacher.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
      message: "Login successful!",
      teacher: { id: teacher._id, name: teacher.name, email: teacher.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong during login." });
  }
});

module.exports = router;