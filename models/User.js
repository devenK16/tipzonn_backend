const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  contactNo: String,
  qrCode: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;