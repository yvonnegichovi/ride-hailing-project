const { calculateDistance, estimateTravelTime } = require('../src/utils/geoUtils');

describe('GeoUtils', () => {
  describe('calculateDistance', () => {
    test('should calculate distance between two coordinates', () => {
      // New York to Los Angeles (approx 3936 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    test('should calculate short distances accurately', () => {
      // Times Square to Central Park (approx 2.5 km)
      const distance = calculateDistance(40.7589, -73.9851, 40.7829, -73.9654);
      expect(distance).toBeGreaterThan(2);
      expect(distance).toBeLessThan(3);
    });
  });

  describe('estimateTravelTime', () => {
    test('should estimate travel time with default speed', () => {
      const time = estimateTravelTime(40); // 40 km at 40 km/h
      expect(time).toBe(60); // 1 hour = 60 minutes
    });

    test('should estimate travel time with custom speed', () => {
      const time = estimateTravelTime(50, 100); // 50 km at 100 km/h
      expect(time).toBe(30); // 0.5 hours = 30 minutes
    });

    test('should handle short distances', () => {
      const time = estimateTravelTime(5, 40); // 5 km at 40 km/h
      expect(time).toBe(8); // ~7.5 minutes rounded to 8
    });
  });
});
