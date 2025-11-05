const config = require('../src/config');

describe('Config', () => {
  test('should have database configuration', () => {
    expect(config.database).toBeDefined();
    expect(config.database.host).toBeDefined();
    expect(config.database.port).toBeDefined();
    expect(config.database.database).toBeDefined();
    expect(config.database.user).toBeDefined();
  });

  test('should have redis configuration', () => {
    expect(config.redis).toBeDefined();
    expect(config.redis.host).toBeDefined();
    expect(config.redis.port).toBeDefined();
  });

  test('should have server configuration', () => {
    expect(config.server).toBeDefined();
    expect(config.server.port).toBeDefined();
    expect(config.server.wsPort).toBeDefined();
  });

  test('should have jwt configuration', () => {
    expect(config.jwt).toBeDefined();
    expect(config.jwt.secret).toBeDefined();
    expect(config.jwt.expiresIn).toBeDefined();
  });

  test('should have stripe configuration', () => {
    expect(config.stripe).toBeDefined();
  });
});
