const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const adminAuth = require('../../middleware/adminAuth');
const SECRET_KEY = process.env.ADMIN_SECRET_KEY;

const router = express.Router();

// Admin sign-up
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
    });

    await newAdmin.save();

    const token = jwt.sign({ username: newAdmin.username, id: newAdmin._id }, SECRET_KEY);

    res.status(201).json({ admin: newAdmin, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ username: admin.username, id: admin._id }, SECRET_KEY);
    res.status(200).json({ admin, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
