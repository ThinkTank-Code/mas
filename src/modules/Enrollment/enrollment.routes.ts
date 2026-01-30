import express from 'express';
import { EnrollmentController } from './enrollment.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

// Learner routes
router.post(
    '/',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    EnrollmentController.initiateEnrollment
);

router.post(
    '/manual',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    EnrollmentController.enrollWithManualPayment
);

router.get(
    '/me',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    EnrollmentController.getMyEnrollments
);

router.get(
    '/:enrollmentId',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    EnrollmentController.getEnrollmentDetails
);

// Admin routes
router.get(
    '/',
    auth(Role.ADMIN, Role.SUPERADMIN),
    EnrollmentController.getAllEnrollments
);

router.put(
    '/:enrollmentId/status',
    auth(Role.ADMIN, Role.SUPERADMIN),
    EnrollmentController.updateEnrollmentStatus
);

export const EnrollmentRoutes = router;
