import express from 'express';
import { AuthController } from '../Auth/auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Proxy to Auth controller for profile endpoints
router.get('/profile', auth(), AuthController.getProfile);
router.put('/profile', auth(), AuthController.updateProfile);

export const UserRoutes = router;
