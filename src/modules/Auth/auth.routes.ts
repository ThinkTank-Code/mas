import express from 'express';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/auth', AuthController.login); // Keep for backward compatibility
router.post('/social-login', AuthController.socialLogin);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationEmail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', auth(), AuthController.getCurrentUser);
router.post('/change-password', auth(), AuthController.changePassword);
router.get('/profile', auth(), AuthController.getProfile);
router.put('/profile', auth(), AuthController.updateProfile);

export const AuthRoutes = router;
