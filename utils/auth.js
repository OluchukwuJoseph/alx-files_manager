import redisClient from './redis';
import dbClient from './db';

export default async function getUserFromToken(token) {
  if (!token) {
    throw new Error('Missing token');
  }

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
