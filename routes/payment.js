const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID_TEST,
  key_secret: process.env.RAZORPAY_KEY_SECRET_TEST,
});

router.post('/create-order', async (req, res) => {
  const { amount, currency, receipt , notes } = req.body;
  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (e.g., 50000 paise for ₹500)
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
