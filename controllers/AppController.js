import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * AppController provides static methods for retrieving application status and statistics.
 *
 * @class
 * @description Handles application-level requests related to system status and data metrics
 */
export default class AppController {
  /**
   * Retrieves the current status of Redis and MongoDB connections.
   *
   * @static
   * @method getStatus
   * @param {Object} req - Express request object (unused in this method)
   * @param {Object} res - Express response object
   * @description Sends a JSON response with connection statuses for Redis and MongoDB
   * @example
   * // Response format
   * {
   *   "redis": true,  // Boolean indicating Redis connection status
   *   "db": true      // Boolean indicating MongoDB connection status
   * }
   */
  static getStatus(req, res) {
    res.send({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  /**
   * Retrieves the total number of users and files in the database.
   *
   * @static
   * @method getStats
   * @async
   * @param {Object} req - Express request object (unused in this method)
   * @param {Object} res - Express response object
   * @description Sends a JSON response with the total count of users and files
   * @example
   * // Response format
   * {
   *   "users": 42,    // Total number of users
   *   "files": 100    // Total number of files
   * }
   */
  static async getStats(req, res) {
    res.send({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  }
}
