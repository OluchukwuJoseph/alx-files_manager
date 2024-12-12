import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * UserController manages user-related operations, primarily user registration.
 *
 * @class
 * @description Handles user creation and registration processes
 */
export default class UserController {
  /**
   * Creates a new user in the system.
   *
   * @static
   * @async
   * @method postNew
   * @param {Object} req - Express request object containing user registration details
   * @param {Object} res - Express response object
   *
   * @description Handles user registration with validation and error handling
   *
   * @returns {void}
   *
   * @throws {400} - Bad Request errors for:
   * - Missing email
   * - Missing password
   * - Email already exists
   *
   * @example
   * // Successful request
   * // POST /users
   * // Request body: { "email": "user@example.com", "password": "securepass" }
   * // Response: { "id": "user_id", "email": "user@example.com" }
   *
   * // Error scenarios
   * // 1. Missing email: 400 status with "Missing email"
   * // 2. Missing password: 400 status with "Missing password"
   * // 3. Existing email: 400 status with "Already exist"
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email presence
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    // Validate password presence
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    // Check if user already exists
    const user = await dbClient.getUser(email);
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    // Create new user
    const result = await dbClient.createUser(email, password);

    // Send successful response with user details
    res.json({ id: result.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      res.status(400).json({ error: 'Missing token' });
      return;
    }

    const email = await redisClient.get(`auth_${token}`);
    if (!email) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await dbClient.getUser(email);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.json({ id: user._id, email: user.email });
  }
}
