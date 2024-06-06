const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  totalTip: { type: Number, default: 0 },
  tips: [
    {
      date: { type: Date, default: Date.now },
      amount: Number
    }
  ],
  workerContactNo: String
});

const Tip = mongoose.model('Tip', tipSchema);

module.exports = Tip;

