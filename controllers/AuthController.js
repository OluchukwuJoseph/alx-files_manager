import SHA1 from 'sha1';
import { v4 } from 'uuid';
import BasicAuth from '../utils/BasicAuth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * AuthController manages user authentication processes.
 * Handles user login (connection) and logout (disconnection) operations.
 */
export default class AuthController {
  /**
   * Authenticates a user and generates a temporary access token.
   *
   * @static
   * @async
   * @method getConnect
   * @param {Object} req - Express request object containing Authorization header
   * @param {Object} res - Express response object for sending authentication result
   *
   * @description
   * Authenticates user credentials and generates a temporary access token:
   * - Extracts and decodes Authorization header
   * - Validates user credentials against database
   * - Generates a unique token and stores it in Redis
   *
   * @throws {Error} Handles various authentication and parsing errors
   *
   * @returns {Object} JSON response
   * - 200 status code with generated token on successful authentication
   * - 400 status code for parsing errors
   * - 401 status code for invalid credentials
   */
  static async getConnect(req, res) {
    try {
      const authorizationHeader = BasicAuth.getAuthorization(req);

      // Extract and decode user credentials from the Authorization header
      const credentials = BasicAuth.getCredentials(authorizationHeader);

      // Retrieve user from database using provided email
      const user = await dbClient.getUser(credentials.email);

      // Validate user credentials
      if (!user || user.password !== SHA1(credentials.password)) {
        // Return 401 Unauthorized if credentials are invalid
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = v4();
      const key = `auth_${token}`;

      // Store token in Redis with user email
      // Set expiration to 24 hours (86400 seconds)
      await redisClient.set(key, user.email, 86400);

      res.status(200).json({ token });
    } catch (err) {
      res.status(400).json({ error: err.message });
      console.log(`An error occured while parsing Authorization Header: ${err.toString()}`);
    }
  }

  /**
   * Logs out a user by invalidating their access token.
   *
   * @static
   * @async
   * @method getDisconnect
   * @param {Object} req
   * @param {Object} res
   *
   * @description
   * Removes the user's authentication token from Redis:
   * - Validates presence of token
   * - Deletes token from Redis cache
   *
   * @returns {Object} HTTP response
   * - 204 No Content on successful logout
   * - 400 status code if token is missing
   * - 401 status code if token deletion fails
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    // Check if token is present
    if (!token) {
      // Return 400 if no token is provided
      res.status(400).json({ error: 'Missing token' });
      return;
    }

    // Attempt to delete token from Redis
    const result = await redisClient.del(`auth_${token}`);

    // Verify token was successfully deleted
    if (!result) {
      // Return 401 if token deletion fails
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Return 204 No Content on successful logout
    res.status(204).json();
  }
}
