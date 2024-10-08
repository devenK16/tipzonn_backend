const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const axios = require('axios');

// Update User Details (No Auth)
router.put('/:id', async (req, res) => {
  const { name, address, contactNo, email, status , qrCode } = req.body;
  const userId = req.params.id;

  try {
    await User.findByIdAndUpdate(userId, { name, address, contactNo, email, status , qrCode });
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// New route for proxying image download
router.get('/:id/download-qr', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    const response = await axios.get(user.qrCode, { responseType: 'arraybuffer' });
    
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename="${user.name.replace(/\s+/g, '_')}QrCode.png"`);
    res.send(response.data);
  } catch (err) {
    console.error('Error downloading QR code:', err);
    res.status(500).json({ message: 'Error downloading QR code' });
  }
});

module.exports = router;
