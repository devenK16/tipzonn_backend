const express = require('express');
const router = express.Router();

router.get('/place', async (req, res) => {
    const { input, key } = req.query;
    const endpoint = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(input)}&inputtype=textquery&fields=place_id&key=${key}`;
  
    try {
      const response = await fetch(endpoint); // Use built-in fetch
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching place ID:', error);
      res.status(500).json({ error: 'Failed to fetch place ID' });
    }
});

module.exports = router;
