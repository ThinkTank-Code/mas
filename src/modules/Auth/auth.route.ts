import { Role } from './../../types/role';
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthController } from './auth.controller';
import { loginValidationSchema, registerValidationSchema, changePasswordValidationSchema, refreshTokenValidationSchema, forgetPasswordValidationSchema, resetPasswordValidationSchema, createUserValidationSchema, updateUserValidationSchema } from './auth.validation';

const router = express.Router();

router.post(
    '/login',
    validateRequest(loginValidationSchema),
    AuthController.login
);

router.post(
    '/register',
    validateRequest(registerValidationSchema),
    AuthController.register
);

router.post(
    '/social-login',
    AuthController.socialLogin
);

router.post('/verify-email', AuthController.verifyEmail);

router.post('/resend-verification', AuthController.resendVerificationEmail);

router.get('/me', auth(), AuthController.getCurrentUser);

router.put('/update-profile', auth(), AuthController.updateProfile);

router.put(
    '/change-password',
    auth(),
    validateRequest(changePasswordValidationSchema),
    AuthController.changePassword
);

router.post(
    '/forget-password',
    validateRequest(forgetPasswordValidationSchema),
    AuthController.forgotPassword
);

router.post(
    '/reset-password',
    validateRequest(resetPasswordValidationSchema),
    AuthController.resetPassword
);

router.post('/refresh-token', AuthController.refreshToken);

export const AuthRoutes = router;