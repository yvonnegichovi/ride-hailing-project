# API Usage Examples

## Example Requests

### 1. Create a New Ride

```bash
curl -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -d '{
    "riderId": 1,
    "pickupLat": 40.7128,
    "pickupLng": -74.0060,
    "dropoffLat": 40.7589,
    "dropoffLng": -73.9851,
    "pickupAddress": "New York, NY",
    "dropoffAddress": "Times Square, NY"
  }'
```

Response:
```json
{
  "id": 1,
  "rider_id": 1,
  "driver_id": null,
  "pickup_latitude": "40.71280000",
  "pickup_longitude": "-74.00600000",
  "dropoff_latitude": "40.75890000",
  "dropoff_longitude": "-73.98510000",
  "pickup_address": "New York, NY",
  "dropoff_address": "Times Square, NY",
  "status": "requested",
  "fare": null,
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

### 2. Find Nearby Drivers

```bash
curl -X GET "http://localhost:3000/api/tracking/nearby?latitude=40.7128&longitude=-74.0060&radius=5"
```

Response:
```json
[
  {
    "id": 1,
    "user_id": 2,
    "license_number": "DL123456",
    "vehicle_make": "Toyota",
    "vehicle_model": "Camry",
    "vehicle_plate": "ABC123",
    "is_available": true,
    "current_latitude": "40.71500000",
    "current_longitude": "-74.00800000",
    "rating": "4.85",
    "name": "John Driver",
    "phone": "+1234567890",
    "distance": 0.34
  }
]
```

### 3. Accept a Ride (Driver)

```bash
curl -X POST http://localhost:3000/api/rides/1/accept \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": 1
  }'
```

### 4. Update Driver Location

```bash
curl -X POST http://localhost:3000/api/tracking/location \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": 1,
    "latitude": 40.7150,
    "longitude": -74.0080,
    "rideId": 1
  }'
```

### 5. Start Ride

```bash
curl -X POST http://localhost:3000/api/rides/1/start
```

### 6. Complete Ride

```bash
curl -X POST http://localhost:3000/api/rides/1/complete \
  -H "Content-Type: application/json" \
  -d '{
    "distance": 5.2,
    "duration": 15
  }'
```

Response includes calculated fare:
```json
{
  "id": 1,
  "status": "completed",
  "fare": "13.55",
  "distance": "5.20",
  "duration": 15
}
```

### 7. Create Payment

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": 1,
    "amount": 13.55,
    "currency": "USD"
  }'
```

Response:
```json
{
  "paymentId": 1,
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 13.55,
  "currency": "USD"
}
```

### 8. Confirm Payment

```bash
curl -X POST http://localhost:3000/api/payments/1/confirm
```

### 9. Get Ride Details

```bash
curl -X GET http://localhost:3000/api/rides/1
```

### 10. Get User's Rides

```bash
curl -X GET "http://localhost:3000/api/rides/user/1?role=rider"
```

## WebSocket Client Example

```javascript
const io = require('socket.io-client');

// Connect to WebSocket server
const socket = io('http://localhost:3000');

// Register user
socket.on('connect', () => {
  console.log('Connected to server');
  
  // Register as a rider
  socket.emit('register', {
    userId: 1,
    userRole: 'rider'
  });
  
  // Join a specific ride room
  socket.emit('join-ride', 1);
});

// Listen for ride updates
socket.on('ride-accepted', (data) => {
  console.log('Ride accepted:', data);
});

socket.on('location-update', (data) => {
  console.log('Driver location:', data.latitude, data.longitude);
});

socket.on('ride-started', (data) => {
  console.log('Ride started:', data);
});

socket.on('ride-completed', (data) => {
  console.log('Ride completed. Fare:', data.fare);
});

socket.on('payment-confirmed', (data) => {
  console.log('Payment confirmed:', data);
});
```

## Testing Flow

1. **Setup**: Create users and drivers in the database
2. **Request Ride**: Rider creates a ride request
3. **Find Driver**: System finds nearby available drivers
4. **Accept Ride**: Driver accepts the ride request
5. **Track Location**: Driver's location is tracked in real-time
6. **Start Ride**: Driver starts the ride
7. **Update Location**: Driver location updates are broadcast via WebSocket
8. **Complete Ride**: Driver completes the ride
9. **Process Payment**: System creates and processes payment
10. **Confirm Payment**: Payment is confirmed

## Calculate Fare

The fare calculation formula:
- Base fare: $2.50
- Per kilometer: $1.50
- Per minute: $0.25

```bash
curl -X POST http://localhost:3000/api/payments/calculate-fare \
  -H "Content-Type: application/json" \
  -d '{
    "distance": 5.2,
    "duration": 15
  }'
```

Response:
```json
{
  "fare": 13.55
}
```

Calculation: $2.50 + (5.2 × $1.50) + (15 × $0.25) = $13.55
