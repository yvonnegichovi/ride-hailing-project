# Project Structure

```
ride-hailing-project/
├── src/
│   ├── config/              # Configuration files
│   │   └── index.js         # Main configuration
│   ├── database/            # Database related files
│   │   ├── db.js           # Database connection
│   │   ├── schema.js       # Database schema definitions
│   │   └── migrate.js      # Migration runner
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js # Error handling middleware
│   │   └── validator.js    # Request validation middleware
│   ├── routes/              # API route handlers
│   │   ├── rides.js        # Ride management endpoints
│   │   ├── tracking.js     # Location tracking endpoints
│   │   └── payments.js     # Payment processing endpoints
│   ├── services/            # Business logic layer
│   │   ├── rideService.js       # Ride management logic
│   │   ├── trackingService.js   # Location tracking logic
│   │   ├── paymentService.js    # Payment processing logic
│   │   ├── redisService.js      # Redis pub/sub management
│   │   └── websocketService.js  # WebSocket management
│   ├── utils/               # Utility functions
│   │   ├── geoUtils.js     # Geographical calculations
│   │   └── asyncHandler.js # Async error handler
│   └── server.js            # Main application entry point
├── tests/                   # Test files
│   ├── payment.test.js
│   ├── geoUtils.test.js
│   └── config.test.js
├── .env.example             # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── API_EXAMPLES.md         # API usage examples
├── Dockerfile              # Docker container definition
├── docker-compose.yml      # Docker Compose configuration
├── jest.config.js          # Jest test configuration
├── package.json            # Project dependencies
├── README.md               # Project documentation
└── setup.sh                # Setup script
```

## Component Descriptions

### Configuration (`src/config/`)
- Centralized configuration management
- Loads environment variables
- Provides configuration for database, Redis, server, JWT, and Stripe

### Database (`src/database/`)
- **db.js**: PostgreSQL connection pool and query methods
- **schema.js**: Database table definitions and creation
- **migrate.js**: Script to run database migrations

### Routes (`src/routes/`)
- **rides.js**: Endpoints for creating, accepting, starting, completing, and canceling rides
- **tracking.js**: Endpoints for location updates and tracking
- **payments.js**: Endpoints for payment processing and fare calculation

### Services (`src/services/`)
- **rideService.js**: Core ride management business logic
- **trackingService.js**: Real-time location tracking and nearby driver search
- **paymentService.js**: Stripe integration and fare calculation
- **redisService.js**: Redis pub/sub for real-time event broadcasting
- **websocketService.js**: WebSocket management for real-time client updates

### Middleware (`src/middleware/`)
- **errorHandler.js**: Centralized error handling
- **validator.js**: Request validation utilities

### Utils (`src/utils/`)
- **geoUtils.js**: Distance calculation and travel time estimation
- **asyncHandler.js**: Wrapper for async route handlers

## Data Flow

### Ride Request Flow
1. Rider creates ride request → `POST /api/rides`
2. `rideService.createRide()` stores in database
3. Redis pub/sub broadcasts `ride-requested` event
4. WebSocket notifies nearby drivers in real-time
5. Driver accepts ride → `POST /api/rides/:id/accept`
6. WebSocket notifies rider of acceptance

### Location Tracking Flow
1. Driver updates location → `POST /api/tracking/location`
2. `trackingService.updateDriverLocation()` updates database
3. Redis pub/sub broadcasts `driver-location` event
4. WebSocket sends location update to ride participants
5. Location stored in history for replay

### Payment Flow
1. Ride completes with fare calculation
2. Payment intent created → `POST /api/payments/create`
3. `paymentService.createPaymentIntent()` integrates with Stripe
4. Redis pub/sub broadcasts `payment-created` event
5. Payment confirmed → `POST /api/payments/:id/confirm`
6. WebSocket notifies participants of payment status

## Real-time Communication

### Redis Pub/Sub Channels
- `driver-location`: Location updates
- `ride-requested`: New ride requests
- `ride-accepted`: Ride acceptances
- `ride-started`: Ride starts
- `ride-completed`: Ride completions
- `ride-cancelled`: Ride cancellations
- `payment-created`: Payment creations
- `payment-confirmed`: Payment confirmations
- `payment-refunded`: Payment refunds

### WebSocket Events
- Clients register with user ID and role
- Join/leave specific ride rooms
- Receive real-time updates for subscribed events
- Bidirectional communication for live tracking

## Database Schema

### Tables
1. **users**: User accounts (riders and drivers)
2. **drivers**: Driver-specific information and vehicle details
3. **rides**: Ride requests and details
4. **payments**: Payment transactions
5. **location_history**: Historical location data for tracking

### Relationships
- Users → Drivers (1:1 for driver role)
- Users → Rides (1:N as rider)
- Drivers → Rides (1:N as driver)
- Rides → Payments (1:1)
- Drivers → Location History (1:N)
- Rides → Location History (1:N)
