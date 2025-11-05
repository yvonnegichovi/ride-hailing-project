const express = require('express');
const router = express.Router();
const trackingService = require('../services/trackingService');

// Update driver location
router.post('/location', async (req, res) => {
  try {
    const { driverId, latitude, longitude, rideId } = req.body;

    if (!driverId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Driver ID, latitude, and longitude are required' });
    }

    const result = await trackingService.updateDriverLocation(
      driverId,
      latitude,
      longitude,
      rideId
    );

    res.json(result);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get ride tracking info
router.get('/ride/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await trackingService.trackRide(parseInt(rideId));
    res.json(ride);
  } catch (error) {
    console.error('Error tracking ride:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get location history for a ride
router.get('/history/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const history = await trackingService.getLocationHistory(parseInt(rideId));
    res.json(history);
  } catch (error) {
    console.error('Error getting location history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Find nearby drivers
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const drivers = await trackingService.findNearbyDrivers(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 5
    );

    res.json(drivers);
  } catch (error) {
    console.error('Error finding nearby drivers:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
