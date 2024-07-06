const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Update User Details (No Auth)
router.put('/:id', async (req, res) => {
  const { name, address, contactNo, email, status } = req.body;
  const userId = req.params.id;

  try {
    await User.findByIdAndUpdate(userId, { name, address, contactNo, email, status });
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
