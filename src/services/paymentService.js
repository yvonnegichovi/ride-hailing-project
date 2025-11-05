const Stripe = require('stripe');
const config = require('../config');
const db = require('../database/db');
const redisService = require('./redisService');

class PaymentService {
  constructor() {
    this.stripe = config.stripe.secretKey ? new Stripe(config.stripe.secretKey) : null;
  }

  async createPaymentIntent(rideId, amount, currency = 'USD') {
    try {
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      // Create payment record
      const paymentResult = await db.query(
        'INSERT INTO payments (ride_id, amount, currency, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [rideId, amount, currency, 'pending']
      );

      const payment = paymentResult.rows[0];

      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: currency.toLowerCase(),
        metadata: {
          ride_id: rideId,
          payment_id: payment.id,
        },
      });

      // Update payment with Stripe payment intent ID
      await db.query(
        'UPDATE payments SET stripe_payment_intent_id = $1, status = $2 WHERE id = $3',
        [paymentIntent.id, 'processing', payment.id]
      );

      // Publish payment event
      await redisService.publish('payment-created', {
        paymentId: payment.id,
        rideId,
        amount,
        status: 'processing',
      });

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentId) {
    try {
      const result = await db.query('SELECT * FROM payments WHERE id = $1', [paymentId]);

      if (result.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = result.rows[0];

      if (!this.stripe || !payment.stripe_payment_intent_id) {
        // Mock payment confirmation for development
        await db.query(
          'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
          ['succeeded', paymentId]
        );

        await redisService.publish('payment-confirmed', {
          paymentId,
          rideId: payment.ride_id,
          status: 'succeeded',
        });

        return { success: true, paymentId, status: 'succeeded' };
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        payment.stripe_payment_intent_id
      );

      // Update payment status
      const status = paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed';
      await db.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, paymentId]
      );

      // Publish payment confirmation event
      await redisService.publish('payment-confirmed', {
        paymentId,
        rideId: payment.ride_id,
        status,
      });

      return { success: status === 'succeeded', paymentId, status };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const result = await db.query('SELECT * FROM payments WHERE id = $1', [paymentId]);

      if (result.rows.length === 0) {
        throw new Error('Payment not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  async refundPayment(paymentId, amount = null) {
    try {
      const result = await db.query('SELECT * FROM payments WHERE id = $1', [paymentId]);

      if (result.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = result.rows[0];

      if (!this.stripe || !payment.stripe_payment_intent_id) {
        // Mock refund for development
        await db.query(
          'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
          ['refunded', paymentId]
        );

        await redisService.publish('payment-refunded', {
          paymentId,
          rideId: payment.ride_id,
          amount: amount || payment.amount,
        });

        return { success: true, paymentId, status: 'refunded' };
      }

      // Create refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      // Update payment status
      await db.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        ['refunded', paymentId]
      );

      // Publish refund event
      await redisService.publish('payment-refunded', {
        paymentId,
        rideId: payment.ride_id,
        amount: refund.amount / 100,
      });

      return { success: true, paymentId, status: 'refunded', refundId: refund.id };
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  calculateFare(distance, duration) {
    // Validate inputs
    if (typeof distance !== 'number' || distance < 0) {
      throw new Error('Distance must be a non-negative number');
    }
    if (typeof duration !== 'number' || duration < 0) {
      throw new Error('Duration must be a non-negative number');
    }

    // Use configurable pricing from config
    const { baseFare, perKmRate, perMinuteRate } = config.pricing;

    const fare = baseFare + (distance * perKmRate) + (duration * perMinuteRate);
    return Math.round(fare * 100) / 100; // Round to 2 decimal places
  }
}

module.exports = new PaymentService();
