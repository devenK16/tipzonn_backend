const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const Worker = require('../models/Worker'); // Import your Worker model

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;
  const { workerIds } = notes; // Modified to support multiple worker IDs 

  try {
    // Find the workers by their IDs and get their UPI IDs
    const workers = await Worker.find({ _id: { $in: workerIds } }); 
    if (!workers.length) { 
      return res.status(404).json({ error: 'Workers not found' });
    }
    const upiIds = workers.map(worker => worker.upiId); // Collect UPI IDs of all workers // here

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (e.g., 50000 paise for ₹500)
      currency,
      receipt,
      notes: {
        ...notes,
        upiIds, // Add the workers' UPI IDs to the notes // here
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
