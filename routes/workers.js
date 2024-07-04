const express = require('express');

const Worker = require('../models/Worker');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get workers
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const workers = await Worker.find({ userId });
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
  
      await worker.deleteOne(); // Replace remove() with deleteOne()
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
    const workers = await Worker.find({ userId }).populate('userId', 'name');

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

// Save FCM token for a specific worker
router.post('/worker/:workerId/token', async (req, res) => {
  const workerId = req.params.workerId;
  const { token } = req.body;

  try {
    const worker = await Worker.findOne({ _id: workerId });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    worker.deviceToken = token;
    await worker.save();

    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;