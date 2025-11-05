# Ride Hailing Project

A real-time ride hailing platform built with Node.js, PostgreSQL, and Redis Pub/Sub. Features include real-time location tracking, payment processing with Stripe, and WebSocket-based notifications.

## Features

- **Real-time Tracking**: Track driver locations in real-time using Redis Pub/Sub and WebSocket
- **Payment Processing**: Integrated Stripe payment processing for ride payments and refunds
- **Database**: PostgreSQL for persistent data storage
- **Real-time Updates**: WebSocket connections for instant notifications
- **RESTful API**: Complete REST API for ride management, tracking, and payments

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Caching/Pub-Sub**: Redis
- **Real-time Communication**: Socket.IO (WebSocket)
- **Payment Processing**: Stripe
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yvonnegichovi/ride-hailing-project.git
cd ride-hailing-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ride_hailing
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-secret-key-here

# Stripe Configuration (optional for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

5. Create the database:
```bash
createdb ride_hailing
```

6. Run database migrations:
```bash
npm run migrate
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Rides

- `POST /api/rides` - Create a new ride request
- `POST /api/rides/:rideId/accept` - Accept a ride (driver)
- `POST /api/rides/:rideId/start` - Start a ride
- `POST /api/rides/:rideId/complete` - Complete a ride
- `POST /api/rides/:rideId/cancel` - Cancel a ride
- `GET /api/rides/:rideId` - Get ride details
- `GET /api/rides/user/:userId?role=rider|driver` - Get user's rides

### Tracking

- `POST /api/tracking/location` - Update driver location
- `GET /api/tracking/ride/:rideId` - Get ride tracking info
- `GET /api/tracking/history/:rideId` - Get location history for a ride
- `GET /api/tracking/nearby?latitude=X&longitude=Y&radius=5` - Find nearby drivers

### Payments

- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/:paymentId/confirm` - Confirm payment
- `GET /api/payments/:paymentId` - Get payment status
- `POST /api/payments/:paymentId/refund` - Refund payment
- `POST /api/payments/calculate-fare` - Calculate fare

## WebSocket Events

### Client to Server

- `register` - Register user with socket connection
  ```javascript
  socket.emit('register', { userId: 123, userRole: 'rider' });
  ```

- `join-ride` - Join a specific ride room
  ```javascript
  socket.emit('join-ride', rideId);
  ```

- `leave-ride` - Leave a ride room
  ```javascript
  socket.emit('leave-ride', rideId);
  ```

### Server to Client

- `location-update` - Real-time driver location updates
- `ride-requested` - New ride request
- `ride-accepted` - Ride accepted by driver
- `ride-started` - Ride started
- `ride-completed` - Ride completed
- `ride-cancelled` - Ride cancelled
- `payment-created` - Payment created
- `payment-confirmed` - Payment confirmed
- `payment-refunded` - Payment refunded

## Database Schema

### Users Table
- Stores user information (riders and drivers)
- Fields: id, email, password_hash, name, phone, role

### Drivers Table
- Stores driver-specific information
- Fields: id, user_id, license_number, vehicle details, location, rating

### Rides Table
- Stores ride information
- Fields: id, rider_id, driver_id, pickup/dropoff locations, status, fare

### Payments Table
- Stores payment information
- Fields: id, ride_id, amount, payment_method, stripe_payment_intent_id, status

### Location History Table
- Stores historical location data for tracking
- Fields: id, driver_id, ride_id, latitude, longitude, timestamp

## Redis Pub/Sub Channels

The application uses Redis Pub/Sub for real-time event broadcasting:

- `driver-location` - Driver location updates
- `ride-requested` - New ride requests
- `ride-accepted` - Ride acceptance events
- `ride-started` - Ride start events
- `ride-completed` - Ride completion events
- `ride-cancelled` - Ride cancellation events
- `payment-created` - Payment creation events
- `payment-confirmed` - Payment confirmation events
- `payment-refunded` - Payment refund events

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Architecture

The application follows a service-oriented architecture:

- **Routes**: Handle HTTP requests and responses
- **Services**: Contain business logic
  - `rideService.js` - Ride management
  - `trackingService.js` - Location tracking
  - `paymentService.js` - Payment processing
  - `redisService.js` - Redis pub/sub management
  - `websocketService.js` - WebSocket management
- **Database**: PostgreSQL for data persistence
- **Redis**: For pub/sub messaging and real-time updates

## Security Considerations

- Environment variables for sensitive data
- Helmet.js for security headers
- Input validation on all endpoints
- CORS configuration
- JWT authentication (to be implemented)

## Future Enhancements

- User authentication and authorization
- Driver/rider registration and profile management
- Rating system
- Advanced routing and ETA calculations
- Push notifications
- Admin dashboard
- Analytics and reporting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License