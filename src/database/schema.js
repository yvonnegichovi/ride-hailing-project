const db = require('./db');

const createTables = async () => {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL CHECK (role IN ('rider', 'driver')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Drivers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        vehicle_make VARCHAR(100),
        vehicle_model VARCHAR(100),
        vehicle_year INTEGER,
        vehicle_plate VARCHAR(20),
        is_available BOOLEAN DEFAULT false,
        current_latitude DECIMAL(10, 8),
        current_longitude DECIMAL(11, 8),
        rating DECIMAL(3, 2) DEFAULT 5.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rides table
    await db.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        rider_id INTEGER REFERENCES users(id),
        driver_id INTEGER REFERENCES drivers(id),
        pickup_latitude DECIMAL(10, 8) NOT NULL,
        pickup_longitude DECIMAL(11, 8) NOT NULL,
        pickup_address TEXT,
        dropoff_latitude DECIMAL(10, 8) NOT NULL,
        dropoff_longitude DECIMAL(11, 8) NOT NULL,
        dropoff_address TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
        fare DECIMAL(10, 2),
        distance DECIMAL(10, 2),
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        ride_id INTEGER REFERENCES rides(id),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_method VARCHAR(50),
        stripe_payment_intent_id VARCHAR(255),
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Location tracking table
    await db.query(`
      CREATE TABLE IF NOT EXISTS location_history (
        id SERIAL PRIMARY KEY,
        driver_id INTEGER REFERENCES drivers(id),
        ride_id INTEGER REFERENCES rides(id),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };
