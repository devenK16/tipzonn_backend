const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: String,
  profession: String,
  upiId: String,
  bankAccountName: String,
  bankAccountNumber: String,
  ifscCode: String,
  photo: String,
  contactNo : String,
  dashboardURL: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false }
});

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;