import dbClient from '../utils/db';
import getUserFromToken from '../utils/auth';

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

  /**
   * Retrieves the current user's profile information.
   *
   * @static
   * @async
   * @method getMe
   * @param {Object} req
   * @param {Object} res
   *
   * @description
   * Fetches and returns the current user's basic profile information:
   * - Extracts authentication token from request headers
   * - Retrieves user details using the token
   * - Returns user ID and email
   *
   * @throws {Error} Handles various authentication and retrieval errors
   *
   * @returns {Object} JSON response with user profile details
   * - 200 status code on successful retrieval
   * - 401 status code for unauthorized access
   * - 400 status code for other errors
   */
  static async getMe(req, res) {
    try {
      // Extract authentication token from request headers
      const token = req.headers['x-token'];

      // Retrieve user details using the token
      const user = await getUserFromToken(token);

      res.json({
        id: user._id,
        email: user.email,
      });
    } catch (err) {
      console.log(`An error occured while retriving user from token: ${err.message}`);
      // Handle unauthorized access specifically
      if (err.message === 'Unauthorized') {
        res.status(401).json({ error: err.message });
        return;
      }
      // Respond with 400 status for other errors
      res.status(400).json({ error: err.message });
    }
  }
}
