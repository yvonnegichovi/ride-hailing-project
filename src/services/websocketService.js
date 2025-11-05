const { Server } = require('socket.io');
const redisService = require('./redisService');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  async initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('register', (data) => {
        const { userId, userRole } = data;
        this.connectedClients.set(socket.id, { userId, userRole, socket });
        socket.join(`user-${userId}`);
        console.log(`User ${userId} (${userRole}) registered with socket ${socket.id}`);
      });

      socket.on('join-ride', (rideId) => {
        socket.join(`ride-${rideId}`);
        console.log(`Socket ${socket.id} joined ride-${rideId}`);
      });

      socket.on('leave-ride', (rideId) => {
        socket.leave(`ride-${rideId}`);
        console.log(`Socket ${socket.id} left ride-${rideId}`);
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        console.log('Client disconnected:', socket.id);
      });
    });

    // Subscribe to Redis channels for real-time updates
    await this.subscribeToEvents();

    console.log('WebSocket service initialized');
  }

  async subscribeToEvents() {
    // Driver location updates
    await redisService.subscribe('driver-location', (data) => {
      if (data.rideId) {
        this.io.to(`ride-${data.rideId}`).emit('location-update', data);
      }
    });

    // Ride events
    await redisService.subscribe('ride-requested', (data) => {
      this.io.emit('ride-requested', data);
    });

    await redisService.subscribe('ride-accepted', (data) => {
      this.io.to(`user-${data.riderId}`).emit('ride-accepted', data);
    });

    await redisService.subscribe('ride-started', (data) => {
      this.io.to(`ride-${data.rideId}`).emit('ride-started', data);
    });

    await redisService.subscribe('ride-completed', (data) => {
      this.io.to(`ride-${data.rideId}`).emit('ride-completed', data);
    });

    await redisService.subscribe('ride-cancelled', (data) => {
      this.io.to(`ride-${data.rideId}`).emit('ride-cancelled', data);
    });

    // Payment events
    await redisService.subscribe('payment-created', (data) => {
      this.io.to(`ride-${data.rideId}`).emit('payment-created', data);
    });

    await redisService.subscribe('payment-confirmed', (data) => {
      this.io.to(`ride-${data.rideId}`).emit('payment-confirmed', data);
    });

    await redisService.subscribe('payment-refunded', (data) => {
      this.io.to(`ride-${data.rideId}`).emit('payment-refunded', data);
    });

    console.log('Subscribed to all Redis events');
  }

  emitToUser(userId, event, data) {
    this.io.to(`user-${userId}`).emit(event, data);
  }

  emitToRide(rideId, event, data) {
    this.io.to(`ride-${rideId}`).emit(event, data);
  }

  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = new WebSocketService();
