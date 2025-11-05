const redisService = require('./redisService');
const db = require('../database/db');

class TrackingService {
  async updateDriverLocation(driverId, latitude, longitude, rideId = null) {
    try {
      // Update driver's current location in database
      await db.query(
        'UPDATE drivers SET current_latitude = $1, current_longitude = $2, updated_at = NOW() WHERE id = $3',
        [latitude, longitude, driverId]
      );

      // Store location in history
      if (rideId) {
        await db.query(
          'INSERT INTO location_history (driver_id, ride_id, latitude, longitude) VALUES ($1, $2, $3, $4)',
          [driverId, rideId, latitude, longitude]
        );
      }

      // Publish location update via Redis
      await redisService.publish('driver-location', {
        driverId,
        latitude,
        longitude,
        rideId,
        timestamp: new Date().toISOString(),
      });

      return { success: true, driverId, latitude, longitude };
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  async trackRide(rideId) {
    try {
      const result = await db.query(
        `SELECT r.*, d.current_latitude, d.current_longitude, d.user_id as driver_user_id
         FROM rides r
         LEFT JOIN drivers d ON r.driver_id = d.id
         WHERE r.id = $1`,
        [rideId]
      );

      if (result.rows.length === 0) {
        throw new Error('Ride not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error tracking ride:', error);
      throw error;
    }
  }

  async getLocationHistory(rideId) {
    try {
      const result = await db.query(
        'SELECT * FROM location_history WHERE ride_id = $1 ORDER BY timestamp ASC',
        [rideId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting location history:', error);
      throw error;
    }
  }

  async findNearbyDrivers(latitude, longitude, radiusKm = 5) {
    try {
      // Using Haversine formula for distance calculation
      // Note: For production with large datasets, consider using PostGIS extension
      // for better performance with spatial indexes. This implementation is suitable
      // for small to medium datasets without requiring additional PostgreSQL extensions.
      const result = await db.query(
        `SELECT d.*, u.name, u.phone,
         (6371 * acos(cos(radians($1)) * cos(radians(d.current_latitude)) * 
         cos(radians(d.current_longitude) - radians($2)) + 
         sin(radians($1)) * sin(radians(d.current_latitude)))) AS distance
         FROM drivers d
         JOIN users u ON d.user_id = u.id
         WHERE d.is_available = true
         AND d.current_latitude IS NOT NULL
         AND d.current_longitude IS NOT NULL
         HAVING distance < $3
         ORDER BY distance
         LIMIT 10`,
        [latitude, longitude, radiusKm]
      );

      return result.rows;
    } catch (error) {
      console.error('Error finding nearby drivers:', error);
      throw error;
    }
  }
}

module.exports = new TrackingService();
