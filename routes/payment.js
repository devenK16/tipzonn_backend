const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const Worker = require('../models/Worker'); // Import your Worker model

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
  const { amount, currency, receipt , notes } = req.body;
  const { workerId } = notes;

  try {
    // Find the worker by workerId and get their UPI ID
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    const { upiId } = worker;
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (e.g., 50000 paise for ₹500)
      currency,
      receipt,
      notes: {
        ...notes,
        upiId, // Add the worker's UPI ID to the notes
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
