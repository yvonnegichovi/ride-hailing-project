const redis = require('redis');
const config = require('../config');

class RedisService {
  constructor() {
    this.publisher = null;
    this.subscriber = null;
  }

  async connect() {
    try {
      // Create publisher client
      this.publisher = redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
      });

      // Create subscriber client
      this.subscriber = redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
      });

      this.publisher.on('error', (err) => console.error('Redis Publisher Error:', err));
      this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

      await this.publisher.connect();
      await this.subscriber.connect();

      console.log('Redis clients connected successfully');
    } catch (error) {
      console.error('Redis connection error:', error);
      throw error;
    }
  }

  async publish(channel, message) {
    try {
      const payload = JSON.stringify(message);
      await this.publisher.publish(channel, payload);
      console.log(`Published to ${channel}:`, message);
    } catch (error) {
      console.error('Redis publish error:', error);
      throw error;
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        try {
          const data = JSON.parse(message);
          callback(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      console.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      console.error('Redis subscribe error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.publisher) await this.publisher.quit();
    if (this.subscriber) await this.subscriber.quit();
    console.log('Redis clients disconnected');
  }
}

module.exports = new RedisService();
