const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviews: [
    {
      date: { type: Date, default: Date.now },
      reviewText: String,
      rating: Number 
    }
  ]
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
