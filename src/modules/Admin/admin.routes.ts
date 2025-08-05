import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { loginValidationSchema } from './admin.validation';
import { AdminAuthController } from './admin.controller';
const router = express.Router();

router.post(
    '/login',
    validateRequest(loginValidationSchema),
    AdminAuthController.loginUser
);

export const AdminAuthRoutes = router;