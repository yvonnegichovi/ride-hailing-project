const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

// Create payment intent
router.post('/create', async (req, res) => {
  try {
    const { rideId, amount, currency } = req.body;

    if (!rideId || !amount) {
      return res.status(400).json({ error: 'Ride ID and amount are required' });
    }

    const payment = await paymentService.createPaymentIntent(
      rideId,
      parseFloat(amount),
      currency
    );

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
router.post('/:paymentId/confirm', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await paymentService.confirmPayment(parseInt(paymentId));
    res.json(result);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment status
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.getPaymentStatus(parseInt(paymentId));
    res.json(payment);
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refund payment
router.post('/:paymentId/refund', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;

    const result = await paymentService.refundPayment(
      parseInt(paymentId),
      amount ? parseFloat(amount) : null
    );

    res.json(result);
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate fare
router.post('/calculate-fare', async (req, res) => {
  try {
    const { distance, duration } = req.body;

    if (!distance || !duration) {
      return res.status(400).json({ error: 'Distance and duration are required' });
    }

    const fare = paymentService.calculateFare(
      parseFloat(distance),
      parseInt(duration)
    );

    res.json({ fare });
  } catch (error) {
    console.error('Error calculating fare:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
