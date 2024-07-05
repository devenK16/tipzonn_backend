const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Tip = require('../models/Tip');
const mongoose = require('mongoose');

// Get user by email
router.get('/', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update User
router.put('/:id', auth, async (req, res) => {
  const { name, address, contactNo , email } = req.body;
  const userId = req.user.id;

  try {
    await User.findByIdAndUpdate(userId, { name, address, contactNo,email });
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to get date range for a day
const getDateRangeForDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper function to get date range for a month
const getDateRangeForMonth = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Helper function to aggregate tips by user
const aggregateUserTips = async (userId, dateRange) => {
  const { start, end } = dateRange;
  const tips = await Tip.aggregate([
    {
      $lookup: {
        from: 'workers',
        localField: 'workerId',
        foreignField: '_id',
        as: 'worker'
      }
    },
    { $unwind: '$worker' },
    {
      $match: {
        'worker.userId': new mongoose.Types.ObjectId(userId),
        'tips.date': { $gte: start, $lte: end }
      }
    },
    { $unwind: '$tips' },
    {
      $match: {
        'tips.date': { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        totalTip: { $sum: '$tips.amount' },
        tips: { $push: '$tips' }
      }
    },
  ]);
  return tips[0] || { totalTip: 0, tips: [] };
};

// Endpoint to get user analytics
router.get('/:userId/analytics', async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const dailyTips = await aggregateUserTips(userId, getDateRangeForDay(new Date()));
    
    const totalTips = await Tip.aggregate([
      {
        $lookup: {
          from: 'workers',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' },
      {
        $match: {
          'worker.userId': new mongoose.Types.ObjectId(userId)
        }
      },
      { $unwind: '$tips' },
      {
        $group: {
          _id: null,
          totalTip: { $sum: '$tips.amount' }
        }
      },
    ]);

    const monthlyBreakdown = await Tip.aggregate([
      {
        $lookup: {
          from: 'workers',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' },
      {
        $match: {
          'worker.userId': new mongoose.Types.ObjectId(userId)
        }
      },
      { $unwind: '$tips' },
      {
        $group: {
          _id: {
            year: { $year: '$tips.date' },
            month: { $month: '$tips.date' }
          },
          totalTip: { $sum: '$tips.amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalTip: { $round: ['$totalTip', 2] }
        }
      },
      { $sort: { 'year': -1, 'month': -1 } },
    ]);

    const response = {
      total: Number(totalTips[0]?.totalTip.toFixed(2)) || 0,
      daily: Number(dailyTips.totalTip.toFixed(2)),
      monthlyBreakdown: monthlyBreakdown
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;