import { Router } from "express";
import AppController from '../controllers/AppController';

// Create an Express server for application-level routes.
const index = Router();

index.get('/status', AppController.getStatus);
index.get('/stats', AppController.getStats);

export default index;
