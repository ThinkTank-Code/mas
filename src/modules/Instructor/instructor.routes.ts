import express from 'express';
import { InstructorController } from './instructor.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

// Instructor profile
router.get(
    '/profile',
    auth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPERADMIN),
    InstructorController.getProfile
);

router.put(
    '/profile',
    auth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPERADMIN),
    InstructorController.updateProfile
);

// Dashboard
router.get(
    '/dashboard',
    auth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPERADMIN),
    InstructorController.getDashboard
);

// Batches
router.get(
    '/batches',
    auth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPERADMIN),
    InstructorController.getAssignedBatches
);

router.get(
    '/batches/:batchId/students',
    auth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPERADMIN),
    InstructorController.getBatchStudents
);

router.get(
    '/batches/:batchId/statistics',
    auth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPERADMIN),
    InstructorController.getBatchStatistics
);



export const InstructorRoutes = router;
