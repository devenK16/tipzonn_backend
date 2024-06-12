const express = require('express');
const router = express.Router();
const Review = require('../models/Reviews');

// Endpoint to add a review
router.post('/addReview/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { reviewText, rating } = req.body;
  
      // Find the user's review document or create a new one if it doesn't exist
      let reviewDoc = await Review.findOne({ userId: userId });
      if (!reviewDoc) {
        reviewDoc = new Review({ userId: userId, reviews: [] });
      }
  
      // Add the new review to the reviews array
      reviewDoc.reviews.push({ reviewText: reviewText, rating: rating });
  
      // Save the updated review document
      await reviewDoc.save();
  
      res.status(200).json({ message: 'Review added successfully', reviewDoc });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Endpoint to get reviews by user ID
  router.get('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the user's review document
      const reviewDoc = await Review.findOne({ userId: userId });
  
      if (!reviewDoc) {
        return res.status(404).json({ message: 'No reviews found for this user' });
      }
  
      res.status(200).json(reviewDoc.reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
