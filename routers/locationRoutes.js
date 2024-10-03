// routes/locationRoutes.js
const express = require('express');
const router = express.Router();

router.post('/updateLocation', (req, res) => {
  const { providerId, latitude, longitude } = req.body;

  io.emit('locationUpdated', { providerId, latitude, longitude });
  
  res.status(200).json({ message: 'Location updated' });
});

module.exports = router;
