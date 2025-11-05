require('dotenv').config();

const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'ride_hailing',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  server: {
    port: parseInt(process.env.PORT) || 3000,
    wsPort: parseInt(process.env.WS_PORT) || 3001,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: '24h',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  pricing: {
    baseFare: parseFloat(process.env.BASE_FARE) || 2.50,
    perKmRate: parseFloat(process.env.PER_KM_RATE) || 1.50,
    perMinuteRate: parseFloat(process.env.PER_MINUTE_RATE) || 0.25,
  },
};

module.exports = config;
