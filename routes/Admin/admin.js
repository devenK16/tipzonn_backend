const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const adminAuth = require('../../middleware/adminAuth');
const Tip = require('../../models/Tip');
const moment = require('moment');

// Get all users with optional filtering by status
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  try {
    const users = await User.find()
      .sort({ _id: -1 }) // Sort by latest users first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await User.countDocuments();

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user status
router.put('/users/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully', user });
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

// Helper function to aggregate tips for all users
const aggregateAllUserTips = async (dateRange) => {
  const { start, end } = dateRange;
  const tips = await Tip.aggregate([
    { $match: { 'tips.date': { $gte: start, $lte: end } } },
    { $unwind: '$tips' },
    { $match: { 'tips.date': { $gte: start, $lte: end } } },
    { $group: { _id: null, totalTip: { $sum: '$tips.amount' }, tips: { $push: '$tips' } } },
  ]);
  return tips[0] || { totalTip: 0, tips: [] };
};

// Endpoint to get all users analytics
router.get('/all-users/analytics', async (req, res) => {
  try {
    const dailyTips = await aggregateAllUserTips(getDateRangeForDay(new Date()));
    const totalTips = await Tip.aggregate([
      { $unwind: '$tips' },
      { $group: { _id: null, totalTip: { $sum: '$tips.amount' }, tips: { $push: '$tips' } } },
    ]);
    const monthlyBreakdown = await Tip.aggregate([
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
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.json({
      daily: Number(dailyTips.totalTip.toFixed(2)),
      total: Number(totalTips[0]?.totalTip.toFixed(2)) || 0,
      monthlyBreakdown: monthlyBreakdown.map(item => ({
        year: item._id.year,
        month: item._id.month,
        totalTip: Number(item.totalTip.toFixed(2))
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to calculate fees from tips within a date range
const calculateFees = async (dateRange) => {
  const { start, end } = dateRange;
  const fees = await Tip.aggregate([
    { $unwind: '$tips' },
    { $match: { 'tips.date': { $gte: start, $lte: end } } },
    { $group: { _id: null, totalFees: { $sum: '$tips.fee' } } },
  ]);
  return fees[0]?.totalFees || 0;
};

// Endpoint to get fees analytics
router.get('/fees/analytics', async (req, res) => {
  try {
    const dailyFees = await calculateFees(getDateRangeForDay(new Date()));
    const totalFees = await Tip.aggregate([
      { $unwind: '$tips' },
      { $group: { _id: null, totalFees: { $sum: '$tips.fee' } } },
    ]);
    const monthlyBreakdown = await Tip.aggregate([
      { $unwind: '$tips' },
      {
        $group: {
          _id: {
            year: { $year: '$tips.date' },
            month: { $month: '$tips.date' }
          },
          monthlyFees: { $sum: '$tips.fee' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.json({
      daily: Number(dailyFees.toFixed(2)),
      total: Number(totalFees[0]?.totalFees.toFixed(2)) || 0,
      monthlyBreakdown: monthlyBreakdown.map(item => ({
        year: item._id.year,
        month: item._id.month,
        fees: Number(item.monthlyFees.toFixed(2))
      }))
    });
  } catch (err) {
    console.error('Error calculating fees:', err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
