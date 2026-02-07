import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { loginValidationSchema } from './admin.validation';
import { AdminAuthController } from './admin.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

// Admin login (public)
router.post(
    '/auth',
    validateRequest(loginValidationSchema),
    AdminAuthController.loginUser
);

// User management (protected routes)
router.get(
    '/users',
    auth(Role.ADMIN, Role.SUPERADMIN),
    AdminAuthController.getAllUsers
);

router.get(
    '/users/:id',
    auth(Role.ADMIN, Role.SUPERADMIN),
    AdminAuthController.getUserById
);

router.post(
    '/users',
    auth(Role.SUPERADMIN),  // Only SuperAdmin can create new admins
    AdminAuthController.createAdmin
);

router.put(
    '/users/:id',
    auth(Role.ADMIN, Role.SUPERADMIN),
    AdminAuthController.updateUser
);

router.patch(
    '/users/:id/status',
    auth(Role.ADMIN, Role.SUPERADMIN),  // Both can suspend users
    AdminAuthController.updateUserStatus
);

router.delete(
    '/users/:id',
    auth(Role.SUPERADMIN),  // Only SuperAdmin can delete
    AdminAuthController.deleteUser
);

// Export not-enrolled users as CSV
router.get(
    '/users/export/not-enrolled',
    auth(Role.ADMIN, Role.SUPERADMIN),
    AdminAuthController.exportNotEnrolledUsers
);

export const AdminAuthRoutes = router;
