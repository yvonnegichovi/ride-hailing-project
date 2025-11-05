const express = require('express');
const router = express.Router();
const rideService = require('../services/rideService');

// Create a new ride request
router.post('/', async (req, res) => {
  try {
    const { riderId, pickupLat, pickupLng, dropoffLat, dropoffLng, pickupAddress, dropoffAddress } = req.body;

    if (!riderId || !pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ride = await rideService.createRide(
      riderId,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      pickupAddress,
      dropoffAddress
    );

    res.status(201).json(ride);
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ error: 'Failed to create ride' });
  }
});

// Accept a ride (driver)
router.post('/:rideId/accept', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: 'Driver ID is required' });
    }

    const ride = await rideService.acceptRide(parseInt(rideId), driverId);
    res.json(ride);
  } catch (error) {
    console.error('Error accepting ride:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start a ride
router.post('/:rideId/start', async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.startRide(parseInt(rideId));
    res.json(ride);
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ error: error.message });
  }
});

// Complete a ride
router.post('/:rideId/complete', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { distance, duration } = req.body;

    if (!distance || !duration) {
      return res.status(400).json({ error: 'Distance and duration are required' });
    }

    const ride = await rideService.completeRide(parseInt(rideId), distance, duration);
    res.json(ride);
  } catch (error) {
    console.error('Error completing ride:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel a ride
router.post('/:rideId/cancel', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId, userRole } = req.body;

    if (!userId || !userRole) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }

    const result = await rideService.cancelRide(parseInt(rideId), userId, userRole);
    res.json(result);
  } catch (error) {
    console.error('Error cancelling ride:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ride by ID
router.get('/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.getRideById(parseInt(rideId));
    res.json(ride);
  } catch (error) {
    console.error('Error getting ride:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's rides
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ error: 'User role is required' });
    }

    const rides = await rideService.getUserRides(parseInt(userId), role);
    res.json(rides);
  } catch (error) {
    console.error('Error getting user rides:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
