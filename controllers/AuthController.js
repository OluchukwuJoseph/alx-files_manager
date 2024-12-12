import SHA1 from 'sha1';
import { v4 } from 'uuid';
import BasicAuth from '../utils/BasicAuth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    try {
      // Get authorization Header if it exists
      const authorizationHeader = BasicAuth.getAuthorization(req);
      // Parse Credentials from Authorization Header
      const credentials = BasicAuth.getCredentials(authorizationHeader);

      // Get user that matches the Credentials from db
      const user = await dbClient.getUser(credentials.email);
      if (!user || user.password !== SHA1(credentials.password)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Generate Token, store it in redis and return token to user
      const token = v4();
      const key = `auth_${token}`;
      await redisClient.set(key, user.email, 86400);

      res.status(200).json({ token });
    } catch (err) {
      res.status(400).json({ error: err.message });
      console.log(`An error occured while parsing Authorization Header: ${err.toString()}`);
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(400).json({ error: 'Missing token' });
      return;
    }

    const result = await redisClient.del(`auth_${token}`);
    if (!result) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.status(204).json();
  }
}
