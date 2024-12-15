import redisClient from './redis';
import dbClient from './db';

/**
 * Retrieves a user from an authentication token.
 *
 * @async
 * @function getUserFromToken
 * @param {string} token - Authentication token to validate
 *
 * @description
 * Validates and retrieves a user based on a provided authentication token.
 * The process involves:
 * - Checking token existence
 * - Retrieving associated email from Redis cache
 * - Fetching user details from the database
 *
 * @throws {Error}
 * - 'Missing token' if no token is provided
 * - 'Unauthorized' if token is invalid or no associated user exists
 *
 * @returns {Object} User object from the database
 */
export default async function getUserFromToken(token) {
  // Validate token existence
  if (!token) {
    throw new Error('Missing token');
  }

  // Retrieve email associated with the token from Redis cache
  // Uses a prefixed key format 'auth_' + token
  const email = await redisClient.get(`auth_${token}`);

  if (!email) {
    throw new Error('Unauthorized');
  }

  const user = await dbClient.getUser(email);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
