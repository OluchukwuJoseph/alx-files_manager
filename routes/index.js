import { Router } from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';

// Create an Express server for application-level routes.
const index = Router();

index.get('/status', AppController.getStatus);
index.get('/stats', AppController.getStats);
index.post('/users', UserController.postNew);

export default index;
