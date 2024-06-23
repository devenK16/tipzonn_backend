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
  
// Endpoint to get reviews by user ID with pagination
router.get('/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;  // Default page to 1 if not specified
      const limit = 20;
      const skip = (page - 1) * limit;

      // Find the user's review document
      const reviewDoc = await Review.findOne({ userId: userId });

      if (!reviewDoc) {
          return res.status(404).json({ message: 'No reviews found for this user' });
      }

      // Get paginated reviews
      const reviews = reviewDoc.reviews.slice(skip, skip + limit);

      res.status(200).json({
          currentPage: page,
          totalPages: Math.ceil(reviewDoc.reviews.length / limit),
          reviews: reviews
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


module.exports = router;
