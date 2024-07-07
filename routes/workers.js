const express = require('express');

const Worker = require('../models/Worker');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Tip = require('../models/Tip');
const mongoose = require('mongoose');
const router = express.Router();
const moment = require('moment');

// Get workers
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const workers = await Worker.find({ userId, deleted: false }); 
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add worker
router.post('/', auth, async (req, res) => {
  const { name , profession , upiId , bankAccountName , bankAccountNumber , ifscCode , photo , contactNo } = req.body;
  const userId = req.user.id;

  try {
    const newWorker = new Worker({ name : name , profession: profession ,upiId: upiId , bankAccountName: bankAccountName , bankAccountNumber : bankAccountNumber , ifscCode: ifscCode , photo: photo, userId: userId , contactNo: contactNo });
    await newWorker.save();
     // Update the worker with the dashboardURL
     newWorker.dashboardURL = `https://www.tipzonn.com/tips/${newWorker._id}`;
     await newWorker.save();
    res.status(201).json( newWorker );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update worker
router.put('/:id', auth, async (req, res) => {
  const { name , profession , upiId , bankAccountName , bankAccountNumber , ifscCode , photo , contactNo } = req.body;
  const workerId = req.params.id;
  const userId = req.user.id;

  try {
    const worker = await Worker.findOne({ _id: workerId, userId });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    worker.name = name;
    worker.profession = profession;
    worker.upiId = upiId;
    worker.bankAccountName = bankAccountName;
    worker.bankAccountNumber = bankAccountNumber;
    worker.ifscCode = ifscCode;
    worker.photo = photo;
    worker.contactNo = contactNo;

    await worker.save();
    res.status(200).json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete worker
router.delete('/:id', auth, async (req, res) => {
    const workerId = req.params.id;
    const userId = req.user.id;
  
    try {
      const worker = await Worker.findOne({ _id: workerId, userId });
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      worker.deleted = true;  // Mark worker as deleted
      await worker.save();

      res.status(202).json(worker);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Get workers by userId
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find workers based on the userId
    const workers = await Worker.find({ userId, deleted: false }).populate('userId', 'name');  // Exclude deleted workers

    if (workers.length === 0) {
      return res.status(404).json({ message: 'No workers found for this user' });
    }

    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get workers by userId for dashboard
router.get('/dashboard/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find workers based on the userId
    const workers = await Worker.find({ userId }).populate('userId', 'name');  // Exclude deleted workers

    if (workers.length === 0) {
      return res.status(404).json({ message: 'No workers found for this user' });
    }

    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get worker by ID test
router.get('/worker/:workerId', async (req, res) => {
  const workerId = req.params.workerId;

  try {
    const worker = await Worker.findOne({ _id: workerId });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to get date range for the current day
const getDateRangeForDay = (date) => {
  const start = moment(date).startOf('day').toDate();
  const end = moment(date).endOf('day').toDate();
  return { start, end };
};

// Helper function to get date range for the current month
const getDateRangeForMonth = (date) => {
  const start = moment(date).startOf('month').toDate();
  const end = moment(date).endOf('month').toDate();
  return { start, end };
};

// Helper function to aggregate tips by date range
const aggregateTips = async (workerId, dateRange) => {
  const { start, end } = dateRange;
  const tips = await Tip.aggregate([
    { $match: { workerId: new mongoose.Types.ObjectId(workerId), 'tips.date': { $gte: start, $lte: end } } },
    { $unwind: '$tips' },
    { $match: { 'tips.date': { $gte: start, $lte: end } } },
    { $group: { _id: null, totalTip: { $sum: '$tips.amount' }, tips: { $push: '$tips' } } },
  ]);

  return tips[0] || { totalTip: 0, tips: [] };
};

// Endpoint to get worker analytics
router.get('/:workerId/analytics', async (req, res) => {
  const workerId = req.params.workerId;
  
  try {
    const dailyTips = await aggregateTips(workerId, getDateRangeForDay(new Date()));
    const totalTips = await Tip.aggregate([
      { $match: { workerId: new mongoose.Types.ObjectId(workerId) } },
      { $unwind: '$tips' },
      { $group: { _id: null, totalTip: { $sum: '$tips.amount' } } },
    ]);

    const monthlyBreakdown = await Tip.aggregate([
      { $match: { workerId: new mongoose.Types.ObjectId(workerId) } },
      { $unwind: '$tips' },
      {
        $group: {
          _id: { year: { $year: '$tips.date' }, month: { $month: '$tips.date' } },
          totalTip: { $sum: '$tips.amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalTip: { $round: ['$totalTip', 2] }  // Round to 2 decimal places
        }
      },
      { $sort: { 'year': -1, 'month': -1 } },  // Sort in descending order to get the most recent month first
    ]);

    const response = {
      total: Number(totalTips[0]?.totalTip.toFixed(2)) || 0,  // Round total to 2 decimal places
      daily: Number(dailyTips.totalTip.toFixed(2)),  // Round daily to 2 decimal places
      monthlyBreakdown: monthlyBreakdown
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;