const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const adminAuth = require('../../middleware/adminAuth');

// Get all users with optional filtering by status
router.get('/users', adminAuth, async (req, res) => {
  const { status } = req.query;
  try {
    let users;
    if (status) {
      users = await User.find({ status });
    } else {
      users = await User.find();
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user status
router.put('/users/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
