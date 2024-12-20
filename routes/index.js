import { Router } from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FileController from '../controllers/FilesController';

// Create an Express server for application-level routes.
const index = Router();

index.get('/status', AppController.getStatus);
index.get('/stats', AppController.getStats);
index.post('/users', UserController.postNew);
index.get('/connect', AuthController.getConnect);
index.get('/disconnect', AuthController.getDisconnect);
index.get('/users/me', UserController.getMe);
index.post('/files', FileController.postUpload);
index.get('/files/:id', FileController.getShow);
index.get('/files', FileController.getIndex);

export default index;
