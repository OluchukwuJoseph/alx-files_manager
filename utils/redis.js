import { createClient } from 'redis';
import { promisify } from 'util';

/**
 * RedisClient class provides an abstraction layer for Redis operations
 * Manages a Redis client with promisified methods for common operations
 */
class RedisClient {
  /**
   * Creates a new Redis client connection
   * - Connects to localhost on default Redis port (6379)
   * - Sets up error handling
   * - Promisifies core Redis methods for easier async usage
   */
  constructor() {
    this.client = createClient({
      host: 'localhost',
      port: 6379,
    });

    // Create Redis client with default localhost configuration
    this.client.on('error', (error) => console.log(`A redis error occured: ${error.message}`));

    // Promisify core Redis methods to use with async/await
    // Binding ensures methods retain the correct context of the Redis client
    this.redisGet = promisify(this.client.get).bind(this.client);
    this.redisSetex = promisify(this.client.setex).bind(this.client);
    this.redisDel = promisify(this.client.del).bind(this.client);
  }

  /**
   * Checks if the Redis client is currently connected
   * @returns {boolean} Connection status of the Redis client
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Retrieves a value from Redis by key
   * @param {string} key - The key to retrieve
   * @returns {Promise<*>} The value associated with the key, or null if not found
   */
  async get(key) {
    const value = await this.redisGet(key);
    return value;
  }

  /**
   * Sets a key-value pair in Redis with an expiration
   * @param {string} key - The key to set
   * @param {*} value - The value to store
   * @param {number} duration - Expiration time in seconds
   * @returns {Promise<*>} Result of the set operation
   */
  async set(key, value, duration) {
    const result = await this.redisSetex(key, duration, value);
    return result;
  }

  /**
   * Deletes a key from Redis
   * @param {string} key - The key to delete
   * @returns {Promise<number>} Number of keys deleted (0 or 1)
   */
  async del(key) {
    const result = await this.redisDel(key);
    return result;
  }
}

// Create and export a single instance of RedisClient to be used across the application
const redisClient = new RedisClient();
export default redisClient;
