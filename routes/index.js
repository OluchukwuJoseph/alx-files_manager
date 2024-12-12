import { Router } from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

// Create an Express server for application-level routes.
const index = Router();

index.get('/status', AppController.getStatus);
index.get('/stats', AppController.getStats);
index.post('/users', UserController.postNew);
index.get('/connect', AuthController.getConnect);
index.get('/disconnect', AuthController.getDisconnect);
index.get('/users/me', UserController.getMe);

export default index;
