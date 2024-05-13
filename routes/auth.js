const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const SECRET_KEY = process.env.SECRET_KEY

const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    
    // Generate QR code
    const qrCodeUrl = `http://tipzonn-main.eba-hvbywyw6.ap-south-1.elasticbeanstalk.com/?userId=${newUser._id}`;
    const qrCodeImage = await qrcode.toDataURL(qrCodeUrl);
    
    // Save QR code to user profile
    newUser.qrCode = qrCodeImage;
    await newUser.save();

    
    const token = jwt.sign({email: newUser.email , id: newUser._id} , SECRET_KEY);
    
    res.status(201).json({user: newUser , token : token });

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email : email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY);
    res.status(200).json({user: user , token : token });

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;