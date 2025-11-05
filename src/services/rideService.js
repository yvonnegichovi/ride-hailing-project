const db = require('../database/db');
const redisService = require('./redisService');
const paymentService = require('./paymentService');

class RideService {
  async createRide(riderId, pickupLat, pickupLng, dropoffLat, dropoffLng, pickupAddress, dropoffAddress) {
    try {
      const result = await db.query(
        `INSERT INTO rides (rider_id, pickup_latitude, pickup_longitude, dropoff_latitude, 
         dropoff_longitude, pickup_address, dropoff_address, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [riderId, pickupLat, pickupLng, dropoffLat, dropoffLng, pickupAddress, dropoffAddress, 'requested']
      );

      const ride = result.rows[0];

      // Publish ride request event
      await redisService.publish('ride-requested', {
        rideId: ride.id,
        riderId,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        timestamp: new Date().toISOString(),
      });

      return ride;
    } catch (error) {
      console.error('Error creating ride:', error);
      throw error;
    }
  }

  async acceptRide(rideId, driverId) {
    try {
      // Check if ride is still available
      const rideResult = await db.query('SELECT * FROM rides WHERE id = $1', [rideId]);
      
      if (rideResult.rows.length === 0) {
        throw new Error('Ride not found');
      }

      const ride = rideResult.rows[0];

      if (ride.status !== 'requested') {
        throw new Error('Ride is not available');
      }

      // Update ride with driver
      const result = await db.query(
        'UPDATE rides SET driver_id = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [driverId, 'accepted', rideId]
      );

      // Update driver availability
      await db.query('UPDATE drivers SET is_available = false WHERE id = $1', [driverId]);

      // Publish ride accepted event
      await redisService.publish('ride-accepted', {
        rideId,
        driverId,
        riderId: ride.rider_id,
        timestamp: new Date().toISOString(),
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error accepting ride:', error);
      throw error;
    }
  }

  async startRide(rideId) {
    try {
      const result = await db.query(
        'UPDATE rides SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['in_progress', rideId]
      );

      if (result.rows.length === 0) {
        throw new Error('Ride not found');
      }

      // Publish ride started event
      await redisService.publish('ride-started', {
        rideId,
        timestamp: new Date().toISOString(),
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error starting ride:', error);
      throw error;
    }
  }

  async completeRide(rideId, distance, duration) {
    try {
      // Calculate fare
      const fare = paymentService.calculateFare(distance, duration);

      // Update ride
      const result = await db.query(
        `UPDATE rides SET status = $1, fare = $2, distance = $3, duration = $4, updated_at = NOW() 
         WHERE id = $5 RETURNING *`,
        ['completed', fare, distance, duration, rideId]
      );

      if (result.rows.length === 0) {
        throw new Error('Ride not found');
      }

      const ride = result.rows[0];

      // Update driver availability
      if (ride.driver_id) {
        await db.query('UPDATE drivers SET is_available = true WHERE id = $1', [ride.driver_id]);
      }

      // Publish ride completed event
      await redisService.publish('ride-completed', {
        rideId,
        fare,
        distance,
        duration,
        timestamp: new Date().toISOString(),
      });

      return ride;
    } catch (error) {
      console.error('Error completing ride:', error);
      throw error;
    }
  }

  async cancelRide(rideId, userId, userRole) {
    try {
      const rideResult = await db.query('SELECT * FROM rides WHERE id = $1', [rideId]);

      if (rideResult.rows.length === 0) {
        throw new Error('Ride not found');
      }

      const ride = rideResult.rows[0];

      // Verify user can cancel this ride
      if (userRole === 'rider' && ride.rider_id !== userId) {
        throw new Error('Unauthorized to cancel this ride');
      }

      // Update ride status
      await db.query(
        'UPDATE rides SET status = $1, updated_at = NOW() WHERE id = $2',
        ['cancelled', rideId]
      );

      // Update driver availability if assigned
      if (ride.driver_id) {
        await db.query('UPDATE drivers SET is_available = true WHERE id = $1', [ride.driver_id]);
      }

      // Publish ride cancelled event
      await redisService.publish('ride-cancelled', {
        rideId,
        cancelledBy: userRole,
        timestamp: new Date().toISOString(),
      });

      return { success: true, rideId };
    } catch (error) {
      console.error('Error cancelling ride:', error);
      throw error;
    }
  }

  async getRideById(rideId) {
    try {
      const result = await db.query(
        `SELECT r.*, 
         ru.name as rider_name, ru.phone as rider_phone,
         du.name as driver_name, du.phone as driver_phone,
         d.vehicle_make, d.vehicle_model, d.vehicle_plate, d.rating
         FROM rides r
         LEFT JOIN users ru ON r.rider_id = ru.id
         LEFT JOIN drivers d ON r.driver_id = d.id
         LEFT JOIN users du ON d.user_id = du.id
         WHERE r.id = $1`,
        [rideId]
      );

      if (result.rows.length === 0) {
        throw new Error('Ride not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting ride:', error);
      throw error;
    }
  }

  async getUserRides(userId, userRole) {
    try {
      let query;
      if (userRole === 'rider') {
        query = 'SELECT * FROM rides WHERE rider_id = $1 ORDER BY created_at DESC';
      } else {
        query = `SELECT r.* FROM rides r 
                 JOIN drivers d ON r.driver_id = d.id 
                 WHERE d.user_id = $1 ORDER BY r.created_at DESC`;
      }

      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user rides:', error);
      throw error;
    }
  }
}

module.exports = new RideService();
