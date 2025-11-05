const paymentService = require('../src/services/paymentService');

describe('PaymentService', () => {
  describe('calculateFare', () => {
    test('should calculate fare correctly with base fare', () => {
      const fare = paymentService.calculateFare(0, 0);
      expect(fare).toBe(2.50);
    });

    test('should calculate fare with distance', () => {
      const fare = paymentService.calculateFare(5, 0);
      expect(fare).toBe(10.00);
    });

    test('should calculate fare with duration', () => {
      const fare = paymentService.calculateFare(0, 10);
      expect(fare).toBe(5.00);
    });

    test('should calculate fare with distance and duration', () => {
      const fare = paymentService.calculateFare(5.2, 15);
      expect(fare).toBe(13.55);
    });

    test('should round fare to 2 decimal places', () => {
      const fare = paymentService.calculateFare(1.333, 1);
      expect(fare).toBe(4.75);
    });

    test('should throw error for negative distance', () => {
      expect(() => paymentService.calculateFare(-5, 10)).toThrow('Distance must be a non-negative number');
    });

    test('should throw error for negative duration', () => {
      expect(() => paymentService.calculateFare(5, -10)).toThrow('Duration must be a non-negative number');
    });

    test('should throw error for non-numeric distance', () => {
      expect(() => paymentService.calculateFare('invalid', 10)).toThrow('Distance must be a non-negative number');
    });

    test('should throw error for non-numeric duration', () => {
      expect(() => paymentService.calculateFare(5, 'invalid')).toThrow('Duration must be a non-negative number');
    });
  });
});
