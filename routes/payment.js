const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
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

router.post('/create-payout', async (req, res) => {
  const { account_number, amount, currency, mode, purpose, fund_account, queue_if_low_balance } = req.body;
  try {
    const payoutOptions = {
      account_number,
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      mode,
      purpose,
      fund_account,
      queue_if_low_balance
    };

    const payout = await razorpay.payouts.create(payoutOptions);
    res.json({ payoutId: payout.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payout' });
  }
});

module.exports = router;
