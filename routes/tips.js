const express = require('express');
const Worker = require('../models/Worker');
const Tip = require('../models/Tip'); // Import the Tip model
const router = express.Router();

// Get tip information for a specific worker by their ID
router.get('/:workerId', async (req, res) => {
  const workerId = req.params.workerId;

  try {
    // Find the worker by ID
    const worker = await Worker.findOne({ _id: workerId });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Find tips associated with the worker
    const tips = await Tip.find({ workerId });

    res.json(tips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a tip for a specific worker by their ID
router.post('/:workerId', async (req, res) => {
    const workerId = req.params.workerId;
    let { amount } = req.body;
  
    try {
      // Find the worker by ID
      const worker = await Worker.findOne({ _id: workerId });
  
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      amount = amount * 0.95;
      // Create a new tip
      const newTip = {
        date: new Date(),
        amount: amount
      };
  
      // Update the total tip amount for the worker
      worker.totalTip += amount;
      await worker.save();
  
      // Find the tip document for the worker
      let tip = await Tip.findOne({ workerId });
  
      if (!tip) {
        // If tip document doesn't exist, create a new one
        tip = new Tip({
          workerId: workerId,
          totalTip: amount,
          tips: [newTip]
        });
      } else {
        // If tip document exists, update total tip amount and add new tip
        tip.totalTip += amount;
        tip.tips.push(newTip);
      }
  
      await tip.save();
  
      res.status(201).json(newTip);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;
