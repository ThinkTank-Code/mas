import express from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

// Admin routes
router.get(
    '/admin',
    auth(Role.ADMIN, Role.SUPERADMIN),
    DashboardController.getAdminDashboard
);

router.get(
    '/users',
    auth(Role.ADMIN, Role.SUPERADMIN),
    DashboardController.getUserStats
);

// Legacy metadata route (60 days stats)
router.get(
    '/metadata',
    auth(Role.ADMIN, Role.SUPERADMIN),
    DashboardController.getDashboardMetaData
);

// Student dashboard route
router.get(
    '/student',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    DashboardController.getStudentDashboard
);


export const DashboardRoutes = router;